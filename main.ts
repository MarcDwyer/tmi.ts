import TwitchChat from "./twitch.ts";
import { red } from "https://deno.land/std/fmt/colors.ts";
import { IrcUrl } from "./twitch_data.ts";
import { getToken } from "./util.ts";

export const endpoint = IrcUrl,
  clientSecret = Deno.env.get("TWITCHSECRET") || "123",
  clientId = Deno.env.get("TWITCH"),
  user = "39BiggusDikus".toLowerCase();
/** simple websocket cli */

const tc = new TwitchChat();

try {
  if (!clientId) throw "No twitch client_id provided";
  console.log(await getToken({ clientId, clientSecret }));
} catch (err) {
  console.log(red(err));
}
