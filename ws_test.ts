import {
  WebSocket,
} from "https://deno.land/x/websocket/mod.ts";
import { IrcUrl } from "./twitch_data.ts";

const ws = new WebSocket(IrcUrl);
ws.on("message", (msg: string) => console.log(msg));
ws.on("open", () => {
  console.log();
});
