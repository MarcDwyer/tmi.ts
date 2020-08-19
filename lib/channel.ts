import { TwitchChat } from "./twitch_chat.ts";
import { TMsgTypes, MsgTypes } from "./twitch_data.ts";
import {
  deferred,
  Deferred,
} from "https://deno.land/std@0.64.0/async/deferred.ts";

class Channel {
  isConnected: boolean = true;
  signal: Deferred<void> = deferred();
  private messages: any[] = [];

  constructor(private chanName: string, private tc: TwitchChat) {}

  async sendMsg(msg: string) {
    const { ws } = this.tc;
    if (!ws) throw new Error("No ws connection has been made");
    const query = `PRIVMSG ${this.chanName} :${msg}`;
    await ws.send(query);
  }
  async part() {
    const { ws } = this.tc;
    try {
      if (!ws) throw "No ws connection has been made";
      if (ws.isClosed) {
        throw "WebSocket connection has been closed";
      }
      this.tc.channels.delete(this.chanName);
      this.isConnected = false;
      await ws.send(`PART #${this.chanName}`);
    } catch (err) {
      console.log(err);
    }
  }
  get ownerDisplayName() {
    return this.chanName.slice(1, this.chanName.length);
  }
  async *msgIterator() {
    while (this.tc.channels.has(this.chanName)) {
      await this.signal;
      for (const msg of this.messages) {
        yield msg;
      }
      this.messages = [];
      this.signal = deferred();
    }
  }
  [Symbol.asyncIterator](msg: string): AsyncIterableIterator<string> {
    this.messages.push(msg);
    return this.msgIterator();
  }
}

export default Channel;
