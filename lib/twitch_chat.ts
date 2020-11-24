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
        rej("Websocket connection has already been established");
        return;
      }
      const ws = new WebSocket(SecureIrcUrl);

      ws.onopen = () => {
        try {
          ws.send(`PASS oauth:${this.oauth}`);
          ws.send(`NICK ${this.username}`);
          this.ws = ws;
        } catch (err) {
          if (typeof err !== "string") err = JSON.stringify(err);
          rej(err);
        }
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
    try {
      if (!this.ws) {
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
