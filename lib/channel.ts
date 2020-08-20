import { TwitchChat } from "./twitch_chat.ts";
import { PrivateMsg } from "./twitch_data.ts";
import {
  deferred,
  Deferred,
} from "https://deno.land/std@0.64.0/async/deferred.ts";

class Channel {
  private isConnected: boolean = true;
  signal: Deferred<void> = deferred();
  messages: PrivateMsg[] = [];

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
      console.log(`parted ${this.chanName}`);
      await ws.send(`PART #${this.chanName}`);
    } catch (err) {
      console.log(err);
    }
  }
  get channelOwnerName() {
    return this.chanName.slice(1, this.chanName.length);
  }
  private async *msgIterator() {
    while (this.isConnected) {
      await this.signal;
      for (const msg of this.messages) {
        if (msg) yield msg;
      }
      this.messages.length = 0;
      this.signal = deferred();
    }
  }
  [Symbol.asyncIterator](): AsyncIterableIterator<PrivateMsg> {
    return this.msgIterator();
  }
}

export default Channel;
