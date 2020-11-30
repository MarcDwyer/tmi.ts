import {
  Deferred,
  deferred,
} from "https://deno.land/std@0.79.0/async/deferred.ts";

export function getChannelName(channel: string) {
  channel = channel.toLowerCase();
  if (channel[0] !== "#") channel = "#" + channel;
  return channel;
}

export function removeBreaks(s: string) {
  return s.replace(/(\r\n|\n|\r)/gm, "");
}

export function findChannelName(str: string) {
  let chan = "";
  for (const char of str) {
    if (char === ":") break;
    chan += char;
  }
  return chan;
}
interface MySignal<T> {
  signal: Deferred<T>;
}
export async function* getAsyncIter<T>(o: MySignal<T>) {
  while (true) {
    try {
      const data = await o.signal;
      yield data;
      o.signal = deferred();
    } catch (_) {
      break;
    }
  }
}
