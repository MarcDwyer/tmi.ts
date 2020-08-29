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
}
export type KeyMessageTypes = keyof typeof MessageTypes;

export type TwitchMessage = {
  tags: Map<string, string>;
  directMsg: boolean;
  raw: string | null;
  prefix: string | null;
  command: KeyMessageTypes | null;
  channel: string | null;
  params: string[];
};
