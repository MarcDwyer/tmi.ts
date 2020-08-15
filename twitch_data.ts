export const IrcUrl = "wss://irc-ws.chat.twitch.tv:443";

export type TwitchCreds = {
  clientId: string;
  clientSecret: string;
  userName: string;
  oauth: string;
};

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};
