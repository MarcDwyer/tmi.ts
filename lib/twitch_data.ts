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

export enum MsgTypes {
  privMsg = "PRIVMSG",
  join = "JOIN",
  part = "PART",
}

type KeysOfMsgTypes = keyof typeof MsgTypes;
export type TMsgTypes = typeof MsgTypes[KeysOfMsgTypes];

export type TwitchMessage = {
  type: TMsgTypes;
  privMsg?: PrivateMsg;
};

export type PrivateMsg = {
  userName: string;
  chatMsg: string;
  chanName: string;
  directMsg: boolean;
};
