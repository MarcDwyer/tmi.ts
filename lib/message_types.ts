export enum MessageTypes {
  privMsg = "PRIVMSG",
}

export function isPrivMsg(msg: string) {
  return msg.includes(MessageTypes.privMsg);
}
//        displayName       address                 msgType channel actualMsg
// msg -- :sinimurk!sinimurk@sinimurk.tmi.twitch.tv PRIVMSG #maya :the scrollwheel to jump

export type PrivateMsg = {
  userName: string;
  chatMsg: string;
  chanName: string;
};
export function handlePrivMsg(msg: string) {
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

  for (let x = start + 1; x < message.length; ++x) {
    const curr = message[x];
    if (curr === " ") {
      start = x;
      break;
    }
    chanName += curr;
  }
  chatMsg = message.slice(start + 2, message.length - 1).join("");
  return {
    userName,
    chatMsg,
    chanName,
  };
}
