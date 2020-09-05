import { TwitchChat } from "./twitch_chat.ts";
import {
  TwitchMessage,
  Commands,
  KeyOfCommands,
  JoinMessage,
  FormattedMessage,
  PrivateMessage,
} from "./twitch_data.ts";
import {
  deferred,
  Deferred,
} from "https://deno.land/std@0.64.0/async/deferred.ts";

import { TwitchCommands } from "./twitch_commands.ts";
import { WebSocket } from "https://deno.land/x/websocket@v0.0.3/lib/websocket.ts";

export type EventFunc = (msg: any) => void;
export type DeferredPayload = {
  type: string;
  payload: any;
};
export class Channel {
  private isConnected: boolean = true;
  private signals = new Map<string, Deferred<any>>();

  commands: TwitchCommands;

  privMsg = this.msgGen<PrivateMessage>(Commands.PRIVMSG);
  joinMsg = this.msgGen<JoinMessage>(Commands.JOIN);
  roomStageMsg = this.msgGen<TwitchMessage>(Commands.ROOMSTATE);
  clearChatMsg = this.msgGen<TwitchMessage>(Commands.CLEARCHAT);
  clearMsg = this.msgGen<TwitchMessage>(Commands.CLEARMSG);
  userNoticeMsg = this.msgGen<TwitchMessage>(Commands.USERNOTICE);
  userStateMsg = this.msgGen<TwitchMessage>(Commands.USERSTATE);

  constructor(private chanName: string, private tc: TwitchChat) {
    this.commands = new TwitchCommands(chanName, this.tc.ws as WebSocket);
  }
  /**
 * 
 * Send a message to the channel
 */
  async send(msg: string) {
    const { ws } = this.tc;
    if (!ws || !this.isConnected) {
      throw new Error("No ws connection has been made");
    }
    const query = `PRIVMSG ${this.chanName} :${msg}`;
    await ws.send(query);
  }
  /**
   * Leave the channel
   */

  async part() {
    const { ws } = this.tc;
    try {
      if (!ws) throw "No ws connection has been made";
      await ws.send(`PART ${this.chanName}`);
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
    const signal = this.signals.get(msg.command);
    signal?.resolve(msg);
  }
  /**
   * @returns an async generator for the purpose of listening to Twitch's irc events
   */
  private msgGen<T>(type: KeyOfCommands) {
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
