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

export enum TMsgTypes {
  PRIVMSG = "PRIVMSG",
  ROOMSTATE = "ROOMSTATE",
  CLEARCHAT = "CLEARCHAT",
  CLEARMSG = "CLEARMSG	",
  GLOBALUSERSTATE = "GLOBALUSERSTATE",
  USERNOTICE = "USERNOTICE",
  USERSTATE = "USERSTATE",
}
export type MessageTypes = keyof typeof TMsgTypes;

export type PrivateMsg = {
  userName: string;
  chatMsg: string;
  chanName: string;
  directMsg: boolean;
};
