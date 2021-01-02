import {
  Deferred,
  deferred,
} from "https://deno.land/std@0.79.0/async/deferred.ts";
import { Channel } from "./channel.ts";
import { SecureIrcUrl, IrcMessage } from "./twitch_data.ts";
import { getAsyncIter, getChannelName } from "./util.ts";
import { msgParcer } from "./parser.ts";

type TwitchChatEvents = "001" | "whisper" | "ping" | "notice";

type TwitchChatCallback = (msg: IrcMessage) => void;

export class TwitchChat {
  /**
   * WebSocket connection to twitch
   */
  ws: WebSocket | null = null;
  /**
   * All of the channels you are conneted to
   */
  channels = new Map<string, Channel>();
  signal: null | Deferred<IrcMessage> = null;

  private username: string;

  private cbs: Record<TwitchChatEvents, TwitchChatCallback | null> = {
    "001": null,
    whisper: null,
    ping: null,
    notice: null,
  };

  constructor(private oauth: string, username: string) {
    this.username = username.toLowerCase();
  }

  /**
   * Connect to Twitch's IRC
   */
  connect() {
    return new Promise<string>((res, rej) => {
      if (this.ws && this.ws.readyState !== this.ws.CLOSED) {
        rej(new Error("Websocket connection has already been established"));
        return;
      }
      const ws = new WebSocket(SecureIrcUrl);

      ws.onopen = () => {
        ws.send(`PASS oauth:${this.oauth}`);
        ws.send(`NICK ${this.username}`);
        this.ws = ws;
      };
      ws.onmessage = (msg) => {
        const tmsg = msgParcer(msg.data, this.username);
        if (tmsg) {
          const lCmd = tmsg.command.toLowerCase();
          if (lCmd in this.cbs) {
            switch (lCmd) {
              case "001":
                ws.send(
                  "CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership"
                );
                this.ws = ws;
                res(msg.data);
                break;
              case "ping":
                ws.send("PONG :tmi.twitch.tv");
                break;
              case "notice":
                if (tmsg.raw.includes("failed")) {
                  if (this.ws) {
                    this.ws = null;
                  }
                  ws.close();
                  rej(new Error(tmsg.raw));
                }
                break;
            }
            if (this.signal) this.signal.resolve(tmsg);
            //@ts-ignore
            const isGlobalCmd: TwitchChatCallback | null = this.cbs[lCmd];
            if (isGlobalCmd) isGlobalCmd(tmsg);
            return;
          }
          const chan = this.channels.get(tmsg.channel);
          if (chan) {
            if (chan.signal) chan.signal.resolve(tmsg);
            //@ts-ignore
            chan.triggerCb(tmsg.command.toLowerCase(), tmsg);
            return;
          }
        }
      };
    });
  }
  joinChannel(chan: string): Channel {
    chan = getChannelName(chan);
    if (!this.ws) {
      throw new Error("Connect before joining");
    }
    const c = new Channel(chan, this);
    this.channels.set(chan, c);
    this.ws.send(`JOIN ${chan}`);
    return c;
  }
  /**
   * Parts all of connected channels disconnects from Twitch's Chat
   */
  disconnect(): string | void {
    if (!this.ws)
      throw new Error("Websocket connected hasnt been established yet");
    for (const channel of this.channels.values()) {
      channel.part();
    }
    if (this.signal) this.signal.reject();
    this.ws.close();
    this.ws = null;
  }

  addEventListener(event: TwitchChatEvents, func: TwitchChatCallback) {
    this.cbs[event] = func;
  }
  [Symbol.asyncIterator](): AsyncIterableIterator<IrcMessage> {
    this.signal = deferred();
    //@ts-ignore
    return getAsyncIter<IrcMessage>(this);
  }
}
