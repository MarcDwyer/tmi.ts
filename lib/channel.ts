import { TwitchChat } from "./twitch_chat.ts";
import { PrivateMsg, MessageTypes } from "./twitch_data.ts";
import {
  deferred,
  Deferred,
} from "https://deno.land/std@0.64.0/async/deferred.ts";

export type EventFunc = (msg: any) => void;

export class Channel {
  private isConnected: boolean = true;
  private funcMap = new Map<MessageTypes, EventFunc>();
  signal: Deferred<PrivateMsg> = deferred();

  constructor(public chanName: string, private tc: TwitchChat) {}

  async send(msg: string) {
    const { ws } = this.tc;
    if (!ws) throw new Error("No ws connection has been made");
    const query = `PRIVMSG ${this.chanName} :${msg}`;
    await ws.send(query);
  }
  async part() {
    const { ws } = this.tc;
    try {
      if (!ws) throw "No ws connection has been made";
      await ws.send(`PART #${this.chanName}`);
      this.tc.channels.delete(this.chanName);
      this.isConnected = false;
    } catch (err) {
      console.log(err);
    }
  }
  get ownerName() {
    return this.chanName.slice(1, this.chanName.length);
  }
  on(event: MessageTypes, func: EventFunc) {
    this.funcMap.set(event, func);
  }
  triggerFunc(evt: MessageTypes, msg: any) {
    const func = this.funcMap.get(evt);
    if (func) func(msg);
  }
  private async *msgIterator() {
    while (this.isConnected) {
      const msg = await this.signal;
      yield msg;
      this.signal = deferred();
    }
  }
  [Symbol.asyncIterator](): AsyncIterableIterator<PrivateMsg> {
    return this.msgIterator();
  }
}
