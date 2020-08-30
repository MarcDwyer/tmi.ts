import {
  TwitchMessage,
  PrivateMessage,
  FormattedMessage,
  MessageTypes,
} from "./twitch_data.ts";

export class FormatMessages {
  constructor(private clientUsername: string, private msg: TwitchMessage) {}

  private privMsg() {
    const { msg } = this;
    const pm: PrivateMessage = {
      directMsg: msg.message.includes(this.clientUsername),
      channel: msg.channel,
      username: msg.username,
      message: msg.message,
      command: msg.command,
      tags: msg.tags,
    };
    return pm;
  }
  format(): FormattedMessage {
    switch (this.msg.command) {
      case MessageTypes.PRIVMSG:
        return this.privMsg();
      default:
        return this.msg;
    }
  }
}
