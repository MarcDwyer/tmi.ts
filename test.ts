import { TwitchChat } from "./mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { assertEquals } from "https://deno.land/std@0.65.0/testing/asserts.ts";
import { isAuthMsg } from "./lib/message_handlers.ts";

const { NEWOAUTH, USERNAME, CID } = config();
const tc = new TwitchChat(
  { oauth: NEWOAUTH, userName: USERNAME.toLowerCase(), clientId: CID },
);

tc.connect().then(() => console.log("resolved")).catch((err) =>
  console.log(`Error triggered: ${err}`)
);

Deno.test("detect authentication messages and return if fail or pass", () => {
  const test1 = {
    test: ":tmi.twitch.tv NOTICE * :Login authentication failed",
    expect: [true, false],
  };
  const test2 = {
    test: `:tmi.twitch.tv 001 gamer112 :Welcome, GLHF!`,
    expect: [true, true],
  };
  const test3 = {
    test: "this is just a random message",
    expect: [false, false],
  };
  for (const { test, expect } of [test1, test2, test3]) {
    assertEquals(isAuthMsg(test), expect);
  }
});
