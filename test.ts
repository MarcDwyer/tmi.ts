import TwitchChat from "./lib/twitch.ts";
import { IrcUrl } from "./lib/twitch_data.ts";
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
  const c = await tc.joinChannel("grubtruckers");
  await c.sendMsg("Im a professional vaper VapeNation");
} catch (err) {
  console.log(red(err));
}
