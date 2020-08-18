# Deno Twitch Message Interface

this package is very similar to [tmi.js](https://github.com/tmijs/tmi.js). This package is still very early in development.

## What it does

Deno TMI allows you to create bots and automate tasks in a users Twitch Chat.

### Example

```typescript
import { TwitchChat } from "./mod.ts";

const tc = new TwitchChat({ userName, clientId, clientSecret, oauth });

await tc.connect();
const channel = await tc.joinChannel("xqc");
await channel.sendMsg("This stream is pepperSpray PogChampions");
await channel.part();
// or

const channels: string[] = ["xqc", "ninja", "sodaPoppin"];

await tc.connect();
await Promise.all(
  channels.map(async (chanName) => {
    const channel = await tc.joinChannel(chanName);
    await channel.sendMsg("wow this stream is Poggers");
  })
);
// tc.channels === Map<chanName, Channel>
for (const channel of tc.channels.values()) {
  await channel.sendMsg(
    "I can also say PogChampions to all connected channels, Poggies!"
  );
}
```
