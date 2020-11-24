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
type Tags = Map<string, string>;

export interface IrcMessage {
  tags: Tags;
  directMsg: boolean;
  raw: string;
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

export type FormattedMessage = JoinMessage | PrivateMessage | IrcMessage;
