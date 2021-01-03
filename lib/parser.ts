import { IrcMessage, Commands } from "./twitch_data.ts";
import { createBadgeObj, setBadges, removeBreaks } from "./util.ts";

/*
	Copyright (c) 2013-2015, Fionn Kelleher All rights reserved.

	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:

		Redistributions of source code must retain the above copyright notice,
		this list of conditions and the following disclaimer.

		Redistributions in binary form must reproduce the above copyright notice,
		this list of conditions and the following disclaimer in the documentation and/or other materials
		provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
	IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
	INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
	WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
	ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
	OF SUCH DAMAGE.
*/
// const str1 =
//  "@badge-info=subscriber/2;badges=subscriber/0,premium/1;client-nonce=98969b4ae51cd142ba08129a5e75c0dd;color=;display-name=Outboardgull52;emotes=;flags=;id=17b342a4-d678-4327-983d-96350e3f6b87;mod=0;room-id=112493351;subscriber=1;tmi-sent-ts=1598426068396;turbo=0;user-id=82012997;user-type= :outboardgull52!outboardgull52@outboardgull52.tmi.twitch.tv PRIVMSG #margauxbrooke :NT";

// type MessageData = {
//   raw: string;
//   tags: Map<string, string>;
//   prefix: string | null;
//   params: string[];
//   command: string | null;
//   channel: null | string;
// };
/**
 *
 * parces messages from twitch's websocket connection
 */

//ex
// [ "badges", "moderator/1,subscriber/3012,glitchcon2020/1" ]

export function msgParcer(data: string, username: string) {
  const message: IrcMessage = {
    raw: data,
    badges: createBadgeObj(),
    //@ts-ignore
    tags: {},
    prefix: "",
    command: Commands.NONE,
    params: [],
    channel: "",
    directMsg: false,
    message: "",
    username: "",
  };

  // Position and nextspace are used by the parser as a reference..
  var position = 0;
  var nextspace = 0;

  // The first thing we check for is IRCv3.2 message tags.
  // http://ircv3.atheme.org/specification/message-tags-3.2
  if (data.charCodeAt(0) === 64) {
    var nextspace = data.indexOf(" ");

    // Malformed IRC message..
    if (nextspace === -1) {
      return null;
    }

    // Tags are split by a semi colon..
    var rawTags = data.slice(1, nextspace).split(";");
    for (var i = 0; i < rawTags.length; i++) {
      // Tags delimited by an equals sign are key=value tags.
      // If there's no equals, we assign the tag a value of true.
      var tag = rawTags[i];
      const [k, v] = tag.split("=");
      if (k === "badges") {
        setBadges(v, message.badges);
      }
      //@ts-ignore
      message.tags[k] = v;
    }

    position = nextspace + 1;
  }

  // Skip any trailing whitespace..
  while (data.charCodeAt(position) === 32) {
    position++;
  }

  // Extract the message's prefix if present. Prefixes are prepended with a colon..
  if (data.charCodeAt(position) === 58) {
    nextspace = data.indexOf(" ", position);

    // If there's nothing after the prefix, deem this message to be malformed.
    if (nextspace === -1) {
      return null;
    }

    message.prefix = data.slice(position + 1, nextspace);
    position = nextspace + 1;

    // Skip any trailing whitespace..
    while (data.charCodeAt(position) === 32) {
      position++;
    }
  }

  nextspace = data.indexOf(" ", position);

  // If there's no more whitespace left, extract everything from the
  // current position to the end of the string as the command..
  if (nextspace === -1) {
    if (data.length > position) {
      //@ts-ignore
      message.command = data.slice(position);
      return message;
    }

    return null;
  }

  // Else, the command is the current position up to the next space. After
  // that, we expect some parameters.
  //@ts-ignore
  message.command = data.slice(position, nextspace);

  position = nextspace + 1;

  // Skip any trailing whitespace..
  while (data.charCodeAt(position) === 32) {
    position++;
  }

  while (position < data.length) {
    nextspace = data.indexOf(" ", position);

    // If the character is a colon, we've got a trailing parameter.
    // At this point, there are no extra params, so we push everything
    // from after the colon to the end of the string, to the params array
    // and break out of the loop.
    if (data.charCodeAt(position) === 58) {
      message.params.push(data.slice(position + 1));
      break;
    }

    // If we still have some whitespace...
    if (nextspace !== -1) {
      // Push whatever's between the current position and the next
      // space to the params array.
      message.params.push(data.slice(position, nextspace));
      position = nextspace + 1;

      // Skip any trailing whitespace and continue looping.
      while (data.charCodeAt(position) === 32) {
        position++;
      }

      continue;
    }

    // If we don't have any more whitespace and the param isn't trailing,
    // push everything remaining to the params array.
    if (nextspace === -1) {
      message.params.push(data.slice(position));
      break;
    }
  }
  if (message.params.length && message.params[0][0] === "#") {
    const copy = { ...message };
    let channel = "";
    for (const char of message.params[0]) {
      if (char === "@") break;
      channel += char;
    }
    message.channel = removeBreaks(channel);
    message.params.shift();
    message.message = removeBreaks(copy.params.join(" "));
  }

  for (const c of message.prefix) {
    if (c === "!") break;
    message.username += c;
  }
  const lowerMsg = message.message.toLowerCase();
  const hasName = lowerMsg.includes(username);
  if (hasName) {
    message.directMsg = true;
  }

  return message;
}
