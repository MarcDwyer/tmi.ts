import { TwitchChat } from "./twitch_chat.ts";
import { IrcMessage } from "./twitch_data.ts";
import { TwitchCommands } from "./twitch_commands.ts";
import { getAsyncIter } from "./util.ts";
import {
  Deferred,
  deferred,
} from "https://deno.land/std@0.79.0/async/deferred.ts";

export type EventFunc = (msg: any) => void;
export type DeferredPayload = {
  type: string;
  payload: any;
};

export type ChannelEvents =
  | "privmsg"
  | "join"
  | "clearchat"
  | "userstate"
  | "usernotice"
  | "clearmsg"
  | "roomstate";

export type ChannelCallback = (msg: IrcMessage) => void;

export class Channel {
  commands: TwitchCommands;
  signal: null | Deferred<IrcMessage> = null;
  private isConnected: boolean = true;

  private cbs: Record<ChannelEvents, ChannelCallback | null> = {
    privmsg: null,
    join: null,
    clearchat: null,
    userstate: null,
    usernotice: null,
    clearmsg: null,
    roomstate: null,
  };

  constructor(public key: string, private tc: TwitchChat) {
    //@ts-ignore
    this.commands = new TwitchCommands(key, tc.ws);
  }
  /**
   *
   * Send a message to the channel
   */
  send(msg: string) {
    const { ws } = this.tc;
    if (!ws || !this.isConnected) {
      throw new Error("No ws connection has been made");
    }
    const query = `PRIVMSG ${this.key} :${msg}`;
    ws.send(query);
  }
  /**
   * Leave the channel
   */

  part() {
    const { ws } = this.tc;
    if (!ws) throw "Websocket not available";
    ws.send(`PART ${this.key}`);
    this.tc.channels.delete(this.key);
    if (this.signal) this.signal.reject();
    this.isConnected = false;
  }
  get channelName() {
    return this.key.slice(1, this.key.length);
  }
  triggerCb(event: ChannelEvents, msg: IrcMessage) {
    const func = this.cbs[event];
    if (func) {
      func(msg);
      return;
    }
  }
  addEventListener(event: ChannelEvents, func: (msg: IrcMessage) => void) {
    this.cbs[event] = func;
  }
  [Symbol.asyncIterator](): AsyncIterableIterator<IrcMessage> {
    this.signal = deferred();
    //@ts-ignore
    return getAsyncIter<IrcMessage>(this);
  }
}
