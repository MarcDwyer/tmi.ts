import {
  WebSocket,
} from "https://deno.land/x/websocket/mod.ts";
import { Channel } from "./channel.ts";
import {
  SecureIrcUrl,
  TwitchCreds,
  MessageTypes,
} from "./twitch_data.ts";

import {
  isAuthMsg,
  isPing,
} from "./message_handlers.ts";
import { getChannelName } from "./util.ts";
import { handleMsg } from "./parser.ts";

/**
 * TwitchChat processes message in async generator then passes down to channel generators
 *        TwitchChat 
 *             |
 * Channel - Channel - Channel
 */
export type MessagePayload = {
  type: MessageTypes;
  channel: string;
  payload: any;
};
export class TwitchChat {
  ws: WebSocket | null = null;
  channels = new Map<string, Channel>();

  constructor(public twitchCred: TwitchCreds) {}

  connect() {
    return new Promise<string>((res, rej) => {
      if (this.ws && !this.ws.isClosed) {
        rej("Websocket connection has already been established");
        return;
      }
      const ws = new WebSocket(SecureIrcUrl);
      ws.on("message", async (msg: string) => {
        //  const args = msg.match(/\S+/g);
        const tmsg = handleMsg(msg);

        if (tmsg && tmsg.channel && tmsg.command) {
          const chan = this.channels.get(tmsg.channel);
          if (!chan) {
            return;
          }
          switch (tmsg.command) {
            case MessageTypes.PRIVMSG:
              chan.triggerMessage(tmsg);
              break;
            default:
              console.log(`Default triggered: ${tmsg.command}`);
          }
        }
        // let channel: Channel | undefined;
        // console.log(args);
        // if (args[2] in TMsgTypes) {
        //   channel = this.channels.get(args[3]);
        //   //@ts-ignore
        //   if (channel) channel.triggerFunc(args[2], msg);
        // }

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
        if (isPing(msg)) {
          ws.send("PONG :tmi.twitch.tv");
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
    console.log(chan);
    try {
      if (
        !this.ws || this.ws && this.ws.isClosed
      ) {
        throw "Connect before joining";
      }
      await this.ws.send(`JOIN ${chan}`);
      const c = new Channel(chan, this);
      this.channels.set(chan, c);
      return c;
    } catch (err) {
      console.error(err);
      return err;
    }
  }
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
}
