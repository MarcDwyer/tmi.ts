import { TwitchChat } from "./twitch_chat.ts";
import { IrcMessage } from "./twitch_data.ts";

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

  constructor(public key: string, private tc: TwitchChat) {}
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
}
