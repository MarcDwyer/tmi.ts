import { Channel } from "./channel.ts";
import { SecureIrcUrl, IrcMessage } from "./twitch_data.ts";
import { getChannelName } from "./util.ts";
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

  private cbs: Record<TwitchChatEvents, TwitchChatCallback | null> = {
    "001": null,
    whisper: null,
    ping: null,
    notice: null,
  };

  constructor(private oauth: string, private username: string) {}

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
        const tmsg = msgParcer(msg.data);
        if (tmsg) {
          const lCmd = tmsg.command.toLowerCase();
          if (lCmd in this.cbs) {
            switch (lCmd) {
              case "001":
                res(msg.data);
                break;
              case "ping":
                ws.send("PONG :tmi.twitch.tv");
                break;
              case "notice":
                if (tmsg.raw.includes("failed")) {
                  rej(new Error(tmsg.raw));
                }
                break;
            }
            //@ts-ignore
            const isGlobalCmd: TwitchChatCallback | null = this.cbs[lCmd];
            if (isGlobalCmd) isGlobalCmd(tmsg);
            return;
          }
          const chan = this.channels.get(tmsg.channel);
          if (chan) {
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
  exit(): string | void {
    try {
      if (!this.ws) throw "Websocket connected hasnt been established yet";
      for (const channel of this.channels.values()) {
        channel.part();
      }
      this.ws.close();
      this.ws = null;
    } catch (err) {
      return err;
    }
  }

  addEventListener(event: TwitchChatEvents, func: TwitchChatCallback) {
    this.cbs[event] = func;
  }
}
