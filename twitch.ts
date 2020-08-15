import {
  WebSocket,
} from "https://deno.land/x/websocket/mod.ts";
import Channel from "./channel.ts";
import { IrcUrl, TokenResponse, TwitchCreds } from "./twitch_data.ts";
import { red } from "https://deno.land/std@0.64.0/fmt/colors.ts";
import { getOAuth } from "./util.ts";

class TwitchChat {
  ws: WebSocket | null = null;
  tokenData: null | TokenResponse = null;
  constructor(private twitchCred: TwitchCreds) {}

  async connect() {
    return new Promise((res, rej) => {
      const ws = new WebSocket(IrcUrl);
      ws.on("message", (msg: string) => console.log(msg));
      ws.on("pong", () => console.log("pong"));
      ws.on("ping", () => {
        console.log("ping");
        ws.send("PONG");
      });
      ws.on("open", async () => {
        try {
          const token: TokenResponse = await getOAuth(this.twitchCred);
          console.log({ token, cred: this.twitchCred });
          await ws.send(
            `PASS oauth:${this.twitchCred.oauth}`,
          );
          await ws.send(`NICK ${this.twitchCred.userName}`);
          this.tokenData = token;
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
  async join(chan: string): Promise<Channel> {
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
}

export default TwitchChat;
