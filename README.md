# Deno Twitch Message Interface

this package is very similar to [tmi.js](https://github.com/tmijs/tmi.js) but for Deno. This package is still very early in development.

## What it does

tmi.ts allows you to create bots and automate tasks in a users Twitch Chat.

## What you need in order to use

1. OAuth token -- https://twitchapps.com/tokengen/ -- make sure that your app's redirect url matches the websites redirect url
2. Twitch Client ID
3. Your Twitch username in lower-case

## Quick Example

```typescript
import { TwitchChat, Channel } from "https://deno.land/x/tmi/mod.ts";
import { delay } from "https://deno.land/std@0.64.0/async/delay.ts";

const tc = new TwitchChat({ userName, clientId, oauth });

const channel = await tc.joinChannel("xqc");

const handlePrivMsg = (async = (chanel: Channel) => {
  for await (const pMsg of channel.privMsg()) {
    // do something with msg here
    if (pMsg.directMsg) {
      console.log(`I've been direct messaged by: ${pmsg.username}`);
    }
  }
});

// Do not await this as it will block the call stack, instead throw it in the event loop.
handlePrivMsg(channel);

await delay(60000);

tc.exit();
```

### TwitchChat

Allows you to connect to Twitch's chat, listen to private whispers and more

- `.connect()`

  Connects to Twitch's secure WebSocket endpoint `wss://irc-ws.chat.twitch.tv:443`.
  Returns a promise that resolves when the user has correctly authenticated else it rejects.

- `.joinChannel(channel: string)`

  Joins the channel that it's given as a parameter.
  Returns a promise.

- `.exit()`

  Parts all channels that have been joined, cleans up everything in the Event Loop
  and closes connection to Twitch's websocket.

- `channels: Map<string, Channel>`

  A Map for all channels that are currently joined.
  If a channel is parted it will also delete itself from this Map.

- `[Symbol.asyncIterator](): AsyncIterableIterator<TwitchMessage>`

  Listen to messages outsite of the scope of a channel for example a whisper (personal message).

```typescript
const tc = new TwitchChat({ clientId, oauth, userName });

await tc.connect();

for await (const whisper of tc) {
  //do something with whisper
}
```

### Channel

Listen to specific events of a channel or part it (leave the channel).

- `.send(message: string)`

  Send a message to the channels chat.

- `.part()`

  Leave the channel, deletes itself from channels Map in TwitchChat, and resolves all of its promises in event loop.

- `.channelOwnerName: string`

  Returns the username of the owner of the chat. For example, if I join "ninja" chat, it will return "ninja".

- `.privMsg(), joinMsg(), roomStageMsg(), clearChatMsg(), clearMsg()`

  These are all async generators. Use them in order to listen to messages and events of the chat's channel.
  The naming of these generators match Irc and Twitch's commands. To read more about this visit `https://dev.twitch.tv/docs/irc/commands`

An example of visiting a single channel

```typescript
const tc = new TwitchChat({ clientId, oauth, userName });

await tc.connect();

const channel await tc.joinChannel("ninja");

// Private messages are just messages of users talking in the chat.

for await (const pMsg of channel.privMsg()) {
  //do something with whisper
}
```

An example of joining multiple channels

```typescript
async function handlePrivMsg(channel: Channel) {
  for await (const pMsg of channel.privMsg()) {
    // do something wwith private message
  }
}
async function handleClearChatMsg(channel: Channel) {
  for await (const ccMsg of channel.clearChatMsg()) {
    console.log(`${ccMsg.username} got banned!`);
  }
}
const tc = new TwitchChat({ clientId, oauth, userName });

await tc.connect();

const channels: string[] = ["xqc", "ninja", "kitboga"];

await Promise.allSettled(
  channels.map(async (chan) => {
    const channel = await tc.joinChannel(chan);
    handlePrivMsg(channel);
    handleClearChatMsg(channel);
  })
);
```
