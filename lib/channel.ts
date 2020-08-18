import { TwitchChat } from "./twitch_chat.ts";

class Channel {
  isConnected: boolean = true;

  constructor(private chanName: string, private tc: TwitchChat) {}

  async sendMsg(msg: string) {
    const { ws } = this.tc;
    try {
      if (!ws) throw "No ws connection has been made";
      const query = `PRIVMSG ${this.chanName} :${msg}`;
      await ws.send(query);
    } catch (err) {
      console.error(err);
    }
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
}

export default Channel;
