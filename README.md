# Deno Twitch Message Interface

this package is very similar to [tmi.js](https://github.com/tmijs/tmi.js). This package is still very early in development.

## What it does

Deno TMI allows you to create bots and automate tasks in a users Twitch Chat.

## What you need in order to use

1. OAuth token -- https://twitchapps.com/tokengen/
2. Twitch Client ID
3. Your Twitch username in lower-case

### Example

```typescript
import { TwitchChat } from "./mod.ts";

const tc = new TwitchChat({ userName, clientId, oauth });

const channel = await tc.joinChannel("xqc");

// Listen to the channels messages
for await (const pmsg of channel) {
  // do something with msg here
  if (pmsg.directMsg) {
    channel.sendMsg(`@${msg.userName} hey whats up! Poggies!`);
  }
}

// OR
// Listen to multiple channels

await tc.connect();

const channels: string[] = ["xqc", "sodapoppin", "ninja"];

const listener = async () => {
  for (const channel of channels) {
    const connChan = await tc.joinChannel(channel);
    for await (const pmsg of connChan) {
      // do something with msg here
    }
  }
};

listener();
```
