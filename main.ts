import TwitchChat from "./twitch.ts";
import { red } from "https://deno.land/std/fmt/colors.ts";
import { IrcUrl } from "./twitch_data.ts";

export const endpoint = IrcUrl,
  clientSecret = Deno.env.get("TWITCHSECRET") || "123",
  clientId = Deno.env.get("TWITCH") || "gamer",
  // Oauth token requres chat:read & chat:edit scopes
  // Use https://twitchapps.com/tokengen/ to get token
  oauth = Deno.env.get("OAUTH") || "no",
  userName = "39BiggusDikus".toLowerCase();
/** simple websocket cli */

const tc = new TwitchChat({ userName, clientId, clientSecret, oauth });

try {
  await tc.connect();
  const c = await tc.join("wildearth");
  await c.sendMsg("is this live");
} catch (err) {
  console.log(red(err));
}
