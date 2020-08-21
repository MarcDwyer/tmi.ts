import { MsgTypes, PrivateMsg } from "./twitch_data.ts";
import { fail } from "https://deno.land/std@0.65.0/testing/asserts.ts";
export function isPrivMsg(msg: string) {
  return msg.includes(MsgTypes.privMsg);
}
//        displayName       address                 msgType channel actualMsg
// msg -- :sinimurk!sinimurk@sinimurk.tmi.twitch.tv PRIVMSG #maya :the scrollwheel to jump

export function handlePrivMsg(msg: string, displayName: string): PrivateMsg {
  const message = msg.split("");
  if (message[0] === ":") message.shift();
  let userName = "";
  let chatMsg = "";
  let chanName = "";
  for (const s of message) {
    if (s === "!") break;
    userName += s;
  }
  let start = message.indexOf("#");

  for (let x = start; x < message.length; ++x) {
    const curr = message[x];
    if (curr === " ") {
      start = x;
      break;
    }
    chanName += curr;
  }
  chatMsg = message.slice(start + 2, message.length - 1).join("");

  const directMsg = chatMsg.toLowerCase().includes(displayName);

  return {
    userName,
    chatMsg,
    chanName,
    directMsg,
  };
}

// :tmi.twitch.tv NOTICE * :Login authentication failed
type AuthStatus = [boolean, boolean];
export function isAuthMsg(msg: string): AuthStatus {
  if (/failed/.test(msg)) return [true, false];
  if (/Welcome/.test(msg)) return [true, true];
  return [false, false];
}
