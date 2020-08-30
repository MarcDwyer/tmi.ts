export const SecureIrcUrl = "wss://irc-ws.chat.twitch.tv:443";

export type TwitchCreds = {
  clientId: string;
  userName: string;
  oauth: string;
};

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scopes?: string[];
};

export enum MessageTypes {
  PRIVMSG = "PRIVMSG",
  ROOMSTATE = "ROOMSTATE",
  CLEARCHAT = "CLEARCHAT",
  CLEARMSG = "CLEARMSG	",
  GLOBALUSERSTATE = "GLOBALUSERSTATE",
  USERNOTICE = "USERNOTICE",
  USERSTATE = "USERSTATE",
  JOIN = "JOIN",
  NONE = "NONE",
}
export type KeyMessageTypes = keyof typeof MessageTypes;
type Tags = Map<string, string>;

export type TwitchMessage = {
  tags: Tags;
  directMsg: boolean;
  raw: string;
  prefix: string;
  command: KeyMessageTypes;
  channel: string;
  params: string[];
  message: string;
  username: string;
};

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

export type FormattedMessage = JoinMessage | PrivateMessage | TwitchMessage;
