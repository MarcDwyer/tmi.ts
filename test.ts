import { assertEquals } from "https://deno.land/std@0.65.0/testing/asserts.ts";
import { delay } from "https://deno.land/x/delay@v0.2.0/src/delay.ts";
import { TwitchChat } from "./lib/twitch_chat.ts";

import { getChannelName } from "./lib/util.ts";

const cid = Deno.env.get("CLIENTID"),
  oauth = Deno.env.get("OAUTH");

if (!cid || !oauth) throw new Error("err getting creds");
// :sinimurk!sinimurk@sinimurk.tmi.twitch.tv PRIVMSG #maya :the scrollwheel to jump
Deno.test("Channel function test", () => {
  const test1 = {
    test: "MaYa",
    expect: "#maya",
  };
  const test2 = {
    test: "knut",
    expect: "#knut",
  };

  for (const { expect, test } of [test1, test2]) {
    assertEquals(getChannelName(test), expect);
  }
});

Deno.test(
  "Should return instance of Error when joining before connecting to TC",
  () => {
    const tc = new TwitchChat(oauth, "roy_stang");
    try {
      tc.joinChannel("knut");
    } catch (e) {
      assertEquals(e instanceof Error, true);
    }
  }
);

Deno.test({
  name: "TC channels map size should be 0 after exiting",
  async fn() {
    const channels = ["knut", "ninja", "alecludford"];
    const tc = new TwitchChat(oauth, "roy_stang");

    try {
      await tc.connect();
      for (const channel of channels) {
        tc.joinChannel(channel);
      }
      await delay(5000);
      tc.exit();

      assertEquals(tc.channels.size === 0, true);
      assertEquals(tc.ws === null, true);
    } catch (e) {
      assertEquals(e instanceof Error, true);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
