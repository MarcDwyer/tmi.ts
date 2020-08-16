import {
  WebSocket,
} from "https://deno.land/x/websocket/mod.ts";
import Channel from "./channel.ts";
import { IrcUrl, TwitchCreds } from "./twitch_data.ts";
import { red } from "https://deno.land/std@0.64.0/fmt/colors.ts";
import { isPrivMsg, handlePrivMsg } from "./message_types.ts";
//        displayName       address                 msgType channel actualMsg
// msg -- :sinimurk!sinimurk@sinimurk.tmi.twitch.tv PRIVMSG #maya :the scrollwheel to jump

class TwitchChat {
  private ws: WebSocket | null = null;
  channels = new Map<string, Channel>();

  constructor(private twitchCred: TwitchCreds) {}

  connect() {
    return new Promise<void>((res, rej) => {
      const ws = new WebSocket(IrcUrl);
      ws.on("message", (msg: string) => {
        if (isPrivMsg(msg)) {
          const pmsg = handlePrivMsg(msg);
          console.log(
            `Channel: ${pmsg.chanName} User: ${pmsg.userName} Says: ${pmsg.chatMsg}`,
          );
        } else {
          console.log(msg);
        }
      });
      ws.on("pong", () => console.log("pong"));
      ws.on("ping", () => {
        console.log("ping");
        ws.send("PONG");
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
    try {
      if (
        !this.ws || this.ws && this.ws.isClosed
      ) {
        throw "Connect before joining";
      }
      await this.ws.send(`JOIN #${chan}`);
      return new Channel(`#${chan}`, this.ws);
    } catch (err) {
      console.error(err);
      return err;
    }
  }
  private handleMsg(msg: string) {
    if (isPrivMsg(msg)) {
      console.log(handlePrivMsg(msg));
    }
  }
}

export default TwitchChat;
