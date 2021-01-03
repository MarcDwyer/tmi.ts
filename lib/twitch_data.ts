export const SecureIrcUrl = "wss://irc-ws.chat.twitch.tv:443";

export type TwitchCreds = {
  userName: string;
  oauth: string;
};

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scopes?: string[];
};

export enum Commands {
  PRIVMSG = "PRIVMSG",
  ROOMSTATE = "ROOMSTATE",
  CLEARCHAT = "CLEARCHAT",
  CLEARMSG = "CLEARMSG",
  GLOBALUSERSTATE = "GLOBALUSERSTATE",
  USERNOTICE = "USERNOTICE",
  USERSTATE = "USERSTATE",
  JOIN = "JOIN",
  NONE = "NONE",
  PING = "PING",
  WHISPER = "WHISPER",
  NOTICE = "NOTICE",
  "001" = "001",
}
export type KeyOfCommands = keyof typeof Commands;

export type Tags = {
  "display-name": string;
  "room-id": string;
  id: string;
  color: string;
  emotes: string;
  mod: string;
  flags: string;
  subscriber: string;
  "tmi-sent-ts": string;
  turbo: string;
  "user-id": string;
  "user-type": string;
};

export type Badges = {
  subscriber: boolean;
  glitchcon: boolean;
  turbo: boolean;
  moderator: boolean;
};

export interface IrcMessage {
  tags: Tags;
  directMsg: boolean;
  raw: string;
  badges: Badges;
  prefix: string;
  command: KeyOfCommands;
  channel: string;
  params: string[];
  message: string;
  username: string;
}
export interface ClearChatMessage extends IrcMessage {
  userName: string;
}
export type JoinMessage = {
  channel: string;
  command: string;
  raw: string;
};

export type PrivateMessage = {
  username: string;
  channel: string;
  message: string;
  directMsg: boolean;
  command: string;
  tags: Tags;
};
