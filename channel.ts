import {
  WebSocket,
} from "https://deno.land/x/websocket/mod.ts";

class Channel {
  isConnected: boolean = true;
  constructor(private chanName: string, private ws: WebSocket) {}

  async sendMsg(msg: string) {
    try {
      const query = `PRIVMSG ${this.chanName} :${msg}`;
      console.log(query);
      await this.ws.send(query);
      console.log(`sent: ${msg}`);
    } catch (err) {
      console.error(err);
    }
  }
}

export default Channel;
