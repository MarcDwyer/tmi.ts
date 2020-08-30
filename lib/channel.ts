import { TwitchChat } from "./twitch_chat.ts";
import {
  TwitchMessage,
  MessageTypes,
  KeyMessageTypes,
  JoinMessage,
  FormattedMessage,
  PrivateMessage,
} from "./twitch_data.ts";
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
  private signals = new Map<string, Deferred<any>>();

  privMsg = this.msgGen<PrivateMessage>(MessageTypes.PRIVMSG);
  joinMsg = this.msgGen<JoinMessage>(MessageTypes.JOIN);
  roomStageMsg = this.msgGen<TwitchMessage>(MessageTypes.ROOMSTATE);

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
  get channelName() {
    return this.chanName.slice(1, this.chanName.length);
  }
  resolveSignal(msg: FormattedMessage) {
    if (!msg.command) {
      throw new Error(`Could not find ${msg.command} in signal map`);
    }
    const signal = this.signals.get(msg.command);
    signal?.resolve(msg);
  }
  private msgGen<T>(type: KeyMessageTypes) {
    let isConnected = this.isConnected;
    const reset = () => {
      //@ts-ignore
      const sig: Deferred<T> = this.signals.set(type, deferred()).get(type);
      isConnected = this.isConnected;
      return sig;
    };
    return async function* () {
      let signal = reset();
      while (isConnected) {
        const msg = await signal;
        yield msg;
        signal = reset();
      }
    };
  }
}
