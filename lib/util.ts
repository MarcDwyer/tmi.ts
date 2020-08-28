import { TokenResponse } from "./twitch_data.ts";

export type OAuthData = {
  clientId: string;
  clientSecret: string;
};
export async function getOAuth(
  { clientSecret, clientId }: OAuthData,
  //@ts-ignore
): Promise<TokenResponse> {
  const url =
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&scope=chat:read chat:edit`;
  try {
    const f = await fetch(url, { method: "POST" });
    const token: TokenResponse = await f.json();
    return token;
  } catch (err) {
    console.log(err);
  }
}

export function getChannelName(channel: string) {
  channel = channel.toLowerCase();
  if (channel[0] !== "#") channel = "#" + channel;
  return channel;
}

export function testStr(msg: string) {
  return msg.split("\r\n");
}

export function isMatch(str: string, arry: string[]) {
  for (const s of arry) {
    if (str === s) return true;
  }
  return false;
}
