import { TwitchChat, MessagePayload } from "./twitch_chat.ts";
import { PrivateMsg, TMsgTypes } from "./twitch_data.ts";
import {
  deferred,
  Deferred,
} from "https://deno.land/std@0.64.0/async/deferred.ts";
export type EventFunc = (msg: any) => void;
export type DeferredPayload = {
  type: string;
  payload: any;
};
export class Channel {
  private isConnected: boolean = true;
  private signals = new Map<string, Deferred<DeferredPayload>>();
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
  private async *msgIterator() {
    while (this.isConnected) {
      const msg = await this.signal;
      yield msg;
      this.signal = deferred();
    }
  }
  pushMsg(msg: MessagePayload) {
    const signal = this.signals.get(msg.type);
    signal?.resolve(msg.payload);
  }
  async *privMsg() {
    let signal = this.signals.set("PRIVMSG", deferred()).get("PRIVMSG");
    while (this.isConnected) {
      const msg = await signal;
      yield msg;
    }
  }
  [Symbol.asyncIterator](): AsyncIterableIterator<PrivateMsg> {
    return this.msgIterator();
  }
}
