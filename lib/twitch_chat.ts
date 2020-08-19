import {
  WebSocket,
} from "https://deno.land/x/websocket/mod.ts";
import Channel from "./channel.ts";
import { SecureIrcUrl, TwitchCreds, MsgTypes } from "./twitch_data.ts";
import { red } from "https://deno.land/std@0.64.0/fmt/colors.ts";
import { isPrivMsg, handlePrivMsg } from "./message_handlers.ts";

export class TwitchChat {
  ws: WebSocket | null = null;
  channels = new Map<string, Channel>();

  constructor(private twitchCred: TwitchCreds) {}
  connect() {
    return new Promise<void>((res, rej) => {
      const ws = new WebSocket(SecureIrcUrl);
      ws.on("message", (msg: string) => {
        if (isPrivMsg(msg)) {
          const pmsg = handlePrivMsg(msg);
          if (this.channels.has(pmsg.chanName)) {
            const c = this.channels.get(pmsg.chanName);
            c?.signal.resolve();
            c?.[Symbol.asyncIterator](pmsg.chatMsg);
          }
        }
      });
      ws.on("pong", () => console.log("pong"));
      ws.on("ping", () => {
        console.log("ping");
        ws.send("pong");
      });
      ws.on("open", async () => {
        try {
          await ws.send(
            `PASS oauth:${this.twitchCred.oauth}`,
          );
          await ws.send(`NICK ${this.twitchCred.userName}`);
          this.ws = ws;
          res();
        } catch (err) {
          if (typeof err !== "string") err = JSON.stringify(err);
          console.log(red(err));
          rej();
        }
      });
      setTimeout(() => {
        if (ws.isClosed) rej();
      }, 2500);
    });
  }
  async joinChannel(chan: string): Promise<Channel> {
    if (chan[0] !== "#") chan = "#" + chan;
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
}
