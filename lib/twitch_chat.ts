import {
  WebSocket,
} from "https://deno.land/x/websocket/mod.ts";
import Channel from "./channel.ts";
import { SecureIrcUrl, TwitchCreds } from "./twitch_data.ts";
import { red } from "https://deno.land/std@0.64.0/fmt/colors.ts";
import {
  isPrivMsg,
  handlePrivMsg,
  isAuthMsg,
} from "./message_handlers.ts";

export class TwitchChat {
  ws: WebSocket | null = null;
  channels = new Map<string, Channel>();

  constructor(private twitchCred: TwitchCreds) {}

  connect() {
    return new Promise<string>((res, rej) => {
      const ws = new WebSocket(SecureIrcUrl);
      ws.on("message", (msg: string) => {
        if (isPrivMsg(msg)) {
          const pmsg = handlePrivMsg(msg, this.twitchCred.userName);
          if (this.channels.has(pmsg.chanName)) {
            const c = this.channels.get(pmsg.chanName);
            c?.messages.push(pmsg);
            c?.signal.resolve();
          }
          return;
        }
        const [authMsg, isSucc] = isAuthMsg(msg);
        if (authMsg) {
          switch (isSucc) {
            case true:
              res(msg);
              break;
            case false:
              ws.close();
              rej(msg);
          }
          return;
        }
      });
      ws.on("ping", (p: any) => {
        console.log(p);
        ws.send(p || new Uint8Array(0xA));
      });
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
