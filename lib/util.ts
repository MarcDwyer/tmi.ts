import { TwitchMessage } from "./twitch_data.ts";

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
export function deleteEmptyKeys(r: TwitchMessage) {
  for (const [k, v] of Object.entries(r)) {
    let del: boolean = false;
    if (Array.isArray(v) && !v.length) {
      del = true;
    } else if (v instanceof Map && v.size === 0) {
      del = true;
    } else if (!v || typeof v === "string" && !v.length) {
      del = true;
    }
    //@ts-ignore
    if (del) delete r[k];
  }
  return r;
}

export function removeBreaks(s: string) {
  return s.replace(/(\r\n|\n|\r)/gm, "");
}
