import { TwitchChat } from "./mod.ts";
import { IrcUrl } from "./mod.ts";
import { red } from "https://deno.land/std/fmt/colors.ts";

export const endpoint = IrcUrl,
  clientSecret = Deno.env.get("TWITCHSECRET") || "123",
  clientId = Deno.env.get("TWITCH") || "gamer",
  // Oauth token requres chat:read & chat:edit scopes
  // Use https://twitchapps.com/tokengen/ to get token
  oauth = "1va6d5h9zjzd9fodc9hfdyv5mhfmve",
  userName = "39BiggusDikus".toLowerCase();
console.log(oauth);
const tc = new TwitchChat(
  { userName, clientId, clientSecret, oauth },
);

try {
  await tc.connect();
  const c = await tc.joinChannel("maya");
  await c.sendMsg(
    `@${c.ownerDisplayName} does this live`,
  );
} catch (err) {
  console.log(red(err));
}
