import {
  IrcMessage,
  PrivateMessage,
  FormattedMessage,
  Commands,
} from "./twitch_data.ts";
import { removeBreaks } from "./util.ts";

export class FormatMessages {
  constructor(private clientUsername: string, private msg: IrcMessage) {}

  private privMsg() {
    const { msg } = this;
    const lowerMsg = msg.message.toLowerCase();
    const pm: PrivateMessage = {
      directMsg: lowerMsg.includes(this.clientUsername),
      channel: msg.channel,
      username: msg.username,
      message: msg.message,
      command: msg.command,
      tags: msg.tags,
    };
    return pm;
  }
  private whisperMsg(): IrcMessage {
    const message = this.msg.params[1];
    if (!message) return this.msg;
    return {
      ...this.msg,
      message: removeBreaks(message),
    };
  }
  format(): FormattedMessage {
    switch (this.msg.command) {
      case Commands.PRIVMSG:
        return this.privMsg();
      case Commands.CLEARCHAT:
        return {
          ...this.msg,
          username: this.msg.message,
        };
      case Commands.WHISPER:
        return this.whisperMsg();
      default:
        return this.msg;
    }
  }
}
