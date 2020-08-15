import { TwitchCreds } from "./twitch_data.ts";
import { TokenResponse } from "./twitch_data.ts";
export function deferred(): {
  promise: Promise<{}>;
  resolve: (value?: {} | PromiseLike<{}>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
} {
  let resolve: (value?: {} | PromiseLike<{}>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject: ((reason?: any) => void) | undefined = undefined;
  const promise = new Promise<{}>((res, rej): void => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}

export async function getOAuth(
  { clientSecret, clientId }: TwitchCreds,
  //@ts-ignore
): Promise<TokenResponse> {
  const url =
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
  try {
    const f = await fetch(url, { method: "POST" });
    const token: TokenResponse = await f.json();
    return token;
  } catch (err) {
    console.log(err);
  }
}
