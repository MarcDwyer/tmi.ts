import { WebSocket } from "https://deno.land/x/websocket@v0.0.3/lib/websocket.ts";

/**
 * For more details on what these commands do visit:
 * https://help.twitch.tv/s/article/chat-commands?language=en_US
 */
export class TwitchCommands {
  constructor(private channel: string, private ws: WebSocket) {}

  /**
   * 
   * @param color can be hex value of "yello" | "red"
   */
  async color(color: string) {
    this.ws.send(`PRIVMSG ${this.channel} :/color ${color}`);
  }
  async ban(username: string) {
    this.ws.send(`PRIVMSG ${this.channel} :/ban ${username}`);
  }
  async unban(username: string) {
    this.ws.send(`PRIVMSG ${this.channel} :/unban ${username}`);
  }
  /**
   * 
   * @param time in seconds
   */
  async commercial(time: number) {
    this.ws.send(`PRIVMSG ${this.channel} :/commercial ${time}`);
  }
  async mods() {
    this.ws.send(`PRIVMSG ${this.channel} :/mods`);
  }
  async vips() {
    this.ws.send(`PRIVMSG ${this.channel} :/vips`);
  }
  async block(username: string) {
    this.ws.send(`PRIVMSG ${this.channel} :/block ${username}`);
  }
  async unblock(username: string) {
    this.ws.send(`PRIVMSG ${this.channel} :/block ${username}`);
  }
  async whisper(username: string, msg: string) {
    this.ws.send(`PRIVMSG ${this.channel} :/w ${username} ${msg}`);
  }
  /**
   * 
   * @param time in seconds
   */
  async timeout(username: string, time: number) {
    this.ws.send(`PRIVMSG ${this.channel} :/timeout ${username} ${time}`);
  }
  /**
   * 
   * @param time in seconds
   */
  async slow(time: number) {
    this.ws.send(`PRIVMSG ${this.channel} :/time ${time}`);
  }
  async slowOff() {
    this.ws.send(`PRIVMSG ${this.channel} :/slowoff`);
  }
  /**
   *  Restrict your chat to all of some of your followers
   * @param time an example would be "30 minutes" or "30m"
   */
  async followers(time?: string) {
    this.ws.send(`PRIVMSG ${this.channel} :/followers ${time || ""}`);
  }
  async followersOff() {
    this.ws.send(`PRIVMSG ${this.channel} :/followersoff`);
  }
  async subscribers() {
    this.ws.send(`PRIVMSG ${this.channel} :/subscribers`);
  }
  async subscribersOff() {
    this.ws.send(`PRIVMSG ${this.channel} :/subscribersoff`);
  }
  async clear() {
    this.ws.send(`PRIVMSG ${this.channel} :/clear`);
  }
  async uniqueChat() {
    this.ws.send(`PRIVMSG ${this.channel} :/uniquechat`);
  }
  async uniqueChatOff() {
    this.ws.send(`PRIVMSG ${this.channel} :/uniquechatoff`);
  }
  async raid(channel: string) {
    this.ws.send(`PRIVMSG ${this.channel} :/raid ${channel}`);
  }
  async unRaid() {
    this.ws.send(`PRIVMSG ${this.channel} :/unraid`);
  }
}
