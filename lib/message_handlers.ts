import { TMsgTypes, PrivateMsg } from "./twitch_data.ts";

export function isPrivMsg(msg: string) {
  return msg.includes(TMsgTypes.PRIVMSG);
}
//        displayName       address                 msgType channel actualMsg
// msg -- :sinimurk!sinimurk@sinimurk.tmi.twitch.tv PRIVMSGls#maya :the scrollwheel to jump

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
  chatMsg = message.slice(start + 2, message.length).join("");

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

// PING :tmi.twitch.tv
export function isPing(msg: string) {
  return msg.startsWith("PING");
}
