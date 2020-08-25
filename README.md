# Deno Twitch Message Interface

this package is very similar to [tmi.js](https://github.com/tmijs/tmi.js) but for Deno. This package is still very early in development.

## What it does

tmi.ts allows you to create bots and automate tasks in a users Twitch Chat.

## What you need in order to use

1. OAuth token -- https://twitchapps.com/tokengen/ -- make sure that your app's redirect url matches the websites redirect url
2. Twitch Client ID
3. Your Twitch username in lower-case

### Example

```typescript
import { TwitchChat, Channel } from "https://deno.land/x/tmi/mod.ts";
import { delay } from "https://deno.land/std@0.64.0/async/delay.ts";

const tc = new TwitchChat({ userName, clientId, oauth });

const channel = await tc.joinChannel("xqc");

const channelListener = async (c: Channel) => {
  for await (const pmsg of c) {
    //do something with PRIVMSG here
    if (pmsg.directMsg) c.send(`@${pmsg.userName} Hey you direct messaged me!`);
  }
};

channelListener(channel);

// Listen to multiple channels

const channels: string[] = ["xqc", "sodapoppin", "ninja"];

// Join all Channels
await Promise.allSettled(
  channels.map(async (channel) => {
    const c = await tc.joinChannel(channel);
    await c.send("Hello I've joined the channel");
    channelListener(c);
  })
);
// Run code here if you want to do something after joining channels;
console.log("Finished joining all channels");
// Wait 10 minutes then close TwitchChat connection
await delay(60000);
tc.exit();
```
