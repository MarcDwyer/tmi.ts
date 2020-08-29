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
