import {
  WebSocket,
} from "https://deno.land/x/websocket/mod.ts";
import { Channel } from "./channel.ts";
import {
  SecureIrcUrl,
  TwitchCreds,
  Commands,
  TwitchMessage,
} from "./twitch_data.ts";

import {
  isAuthMsg,
} from "./message_handlers.ts";
import { getChannelName, findChannelName } from "./util.ts";
import { msgParcer } from "./parser.ts";
import { FormatMessages } from "./format_messages.ts";
import {
  Deferred,
  deferred,
} from "https://deno.land/std@0.65.0/async/deferred.ts";

export class TwitchChat {
  /**
   * WebSocket connection to twitch
   */
  ws: WebSocket | null = null;
  /**
   * All of the channels you are conneted to
   */
  channels = new Map<string, Channel>();

  private signal: Deferred<TwitchMessage> = deferred();

  constructor(public twitchCred: TwitchCreds) {}

  /**
   * Connect to Twitch's IRC
   */
  connect() {
    return new Promise<string>((res, rej) => {
      if (this.ws && !this.ws.isClosed) {
        rej("Websocket connection has already been established");
        return;
      }
      const ws = new WebSocket(SecureIrcUrl);
      ws.on("message", (msg: string) => {
        const tmsg = msgParcer(msg);
        if (tmsg) {
          const formatted = new FormatMessages(this.twitchCred.userName, tmsg)
            .format();
          switch (tmsg.command) {
            case Commands.PING:
              this.ws?.send("PONG :tmi.twitch.tv");
              break;
            case Commands.WHISPER:
              this.signal.resolve(formatted as TwitchMessage);
              break;
            default:
              if (tmsg.command in Commands) {
                let chan = this.channels.get(tmsg.channel);
                if (!chan) {
                  const tryAgain = findChannelName(tmsg.channel);
                  if (this.channels.has(tryAgain)) {
                    console.log(`Tried again: ${tryAgain}`);
                    chan = this.channels.get(tryAgain);
                    tmsg.channel = tryAgain;
                  } else {
                    console.error(
                      `Couldnt find: ${tmsg.channel}, ${tmsg.command}`,
                    );
                    return;
                  }
                }
                chan?.resolveSignal(formatted);
              } else {
                console.log(`Unknown command: ${tmsg.command}`);
              }
          }
        }

        const [authMsg, isSucc] = isAuthMsg(msg);
        if (authMsg) {
          switch (isSucc) {
            case true:
              this.ws?.send(
                "CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership",
              );
              res(msg);
              break;
            case false:
              ws.close();
              rej(msg);
          }
          return;
        }
      });

      ws.on("ping", (p: any) => ws.send(p || new Uint8Array(0xA)));

      ws.on("open", async () => {
        try {
          await ws.send(
            `PASS oauth:${this.twitchCred.oauth}`,
          );
          await ws.send(`NICK ${this.twitchCred.userName}`);
          this.ws = ws;
        } catch (err) {
          if (typeof err !== "string") err = JSON.stringify(err);
          rej(err);
        }
      });
    });
  }
  async joinChannel(chan: string): Promise<Channel> {
    chan = getChannelName(chan);
    try {
      if (
        !this.ws || this.ws && this.ws.isClosed
      ) {
        throw "Connect before joining";
      }
      const c = new Channel(chan, this);
      this.channels.set(chan, c);
      this.ws.send(`JOIN ${chan}`);
      return c;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
  /**
   * Parts all of connected channels and cleans up all promises
   */
  async exit(): Promise<string | void> {
    try {
      if (!this.ws) throw "Websocket connected hasnt been established yet";
      for (const channel of this.channels.values()) {
        await channel.part();
      }
      await this.ws.close();
      this.ws = null;
    } catch (err) {
      return err;
    }
  }
  /**
   * Listen to commands that are outside the scope of a Channel
   * such as private whispers
   */
  async *whisperMsgs() {
    while (this.ws) {
      const globalmsg = await this.signal;
      yield globalmsg;
      this.signal = deferred();
    }
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<TwitchMessage> {
    return this.whisperMsgs();
  }
}
