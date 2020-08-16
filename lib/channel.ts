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
    } catch (err) {
      console.error(err);
    }
  }
  async part() {
    try {
      if (this.ws.isClosed) {
        this.isConnected = false;
        throw "WebSocket connection has been closed";
      }
      await this.ws.send(`PART #${this.chanName}`);
    } catch (err) {
      console.log(err);
    }
  }
  async reJoin() {
    try {
      if (
        this.isConnected
      ) {
        throw `You are still connected to channel: ${this.chanName}`;
      }
      await this.ws.send(`JOIN #${this.chanName}`);
      this.isConnected = true;
      return this;
    } catch (err) {
      console.log(err);
    }
  }
}

export default Channel;
