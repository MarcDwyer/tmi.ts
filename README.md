# Deno Twitch Message Interface

this package is very similar to [tmi.js](https://github.com/tmijs/tmi.js) but for Deno. This package is still very early in development.

## What it does

tmi.ts allows you to create bots and automate tasks in a users Twitch Chat.

## What you need in order to use

1. OAuth token -- https://twitchapps.com/tokengen/ -- make sure that your app's redirect url matches the websites redirect url
2. Twitch Client ID
3. Your Twitch username in lower-case

## Quick Examples

### Method One (Callbacks)

```typescript
import { TwitchChat, Channel } from "https://deno.land/x/tmi/mod.ts";
import { delay } from "https://deno.land/std@0.64.0/async/delay.ts";

const tc = new TwitchChat(oauth, username);

try {
await tc.connect();

tc.addEventListener("whisper", (whisper) => {
     // Do something with whisper here
})

const channel = tc.joinChannel("xqcow");

channel.addEventListener("privmsg", (ircMsg) => {
  if (ircMsg.message.includes("badword")) {
   channel.commands.ban(ircMsg.username)
  } else if (ircMsg.directMsg) {
    console.log(`You have been messaged by ${ircMsg.username}`)
  }
});

await delay(60000);

tc.disconnect();
} catch(err) {
console.error(err)
}
```

### Method Two (Async Iterators)

```typescript
import { TwitchChat, Channel } from "https://deno.land/x/tmi/mod.ts";
import { delay } from "https://deno.land/std@0.64.0/async/delay.ts";

const tc = new TwitchChat(oauth, username);

async function listenWhispers(tc: TwitchChat) {
  for await (const ircmsg of tc) {
    switch (ircmsg.command) {
      case "whisper":
      // Do something with ircmsg here
    }
  }
}

async function listenChannel(c: Channel) {
  for await (const ircmsg of c) {
    switch (ircmsg.command) {
      case "PRIVMSG":
      // Do something with ircmsg here
    }
  }
}

try {
  await tc.connect();
  listenWhispers(tc);

  const channel = tc.joinChannel("hasanabi");
  listenChannel(channel);
} catch (e) {
  console.error(e);
}
```

## TwitchChat

Allows you to connect to Twitch's chat, listen to private whispers and more

- `.connect()`

  Connects to Twitch's secure WebSocket endpoint `wss://irc-ws.chat.twitch.tv:443`.
  Returns a promise that resolves when the user has correctly authenticated else it rejects.

- `.joinChannel(channel: string)`

  Joins the channel that it's given as a parameter.
  Returns a promise.

- `.disconnect()`

  Parts all channels that have been joined, cleans up everything in the Event Loop
  and closes connection to Twitch's websocket.

- `channels: Map<string, Channel>`

  A Map for all channels that are currently joined.
  If a channel is parted it will also delete itself from this Map.

- `.addEventListener(event: TwitchChatEvents, (msg: IrcMessage) => void)`

  Handle specific events outside the scope of a channel like, whispers, notices, and pings etc.
  Events are specific strings which TypeScript should help you out with.

### Channel

Listen to specific events of a channel or part it (leave the channel).

- `.send(message: string)`

  Send a message to the channels chat.

- `.part()`

  Leave the channel, deletes itself from channels Map in TwitchChat, and resolves all of its promises in event loop.

- `.channelOwnerName: string`

  Returns the username of the owner of the chat. For example, if I join "ninja" chat, it will return "ninja".

- `.commands`

  These are commands that can be used in a twitch chat. Note that certain commands require certain [scopes](https://dev.twitch.tv/docs/irc/guide#scopes-for-irc-commands) in your oauth token `. For more information about these commands
  visit: [twitch's docs](https://help.twitch.tv/s/article/chat-commands?language=en_US)

- `.addEventListener(event: ChannelEvent, (msg: IrcMsg) => void)`

  Handle events such as privmsg, joins, roomstate etc.

  **Tip: privmsg is the event which handles chat messsages**
