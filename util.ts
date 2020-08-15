import { red } from "https://deno.land/std@0.64.0/fmt/colors.ts";
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

export type TwitchCreds = {
  clientId: string;
  clientSecret: string;
};
export function tokenUrl({ clientId, clientSecret }: TwitchCreds) {
  const url =
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
  return url;
}
export async function getToken(creds: TwitchCreds) {
  try {
    const url = tokenUrl(creds);
    console.log(url);
    const f = await fetch(url, { method: "POST" });
    const token = await f.json();

    return token;
  } catch (err) {
    console.log(err);
  }
}
