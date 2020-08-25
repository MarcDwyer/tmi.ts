import { assertEquals } from "https://deno.land/std@0.65.0/testing/asserts.ts";
import {
  isAuthMsg,
  handlePrivMsg,
  isPing,
  isPrivMsg,
} from "./lib/message_handlers.ts";
import { PrivateMsg } from "./lib/twitch_data.ts";
import { getChannelName } from "./lib/util.ts";

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
  const test4 = {
    test: "PING :tmi.twitch.tv",
    expect: [false, false],
  };
  for (const { test, expect } of [test1, test2, test3, test4]) {
    assertEquals(isAuthMsg(test), expect);
  }
});
// :sinimurk!sinimurk@sinimurk.tmi.twitch.tv PRIVMSG #maya :the scrollwheel to jump
type PrivTest = {
  expect: PrivateMsg;
  test: string;
};
Deno.test("PrivMsg should return PrivateMsg type", () => {
  const user = "gamer112";
  const test1: PrivTest = {
    test:
      ":sinimurk!sinimurk@sinimurk.tmi.twitch.tv PRIVMSG #maya :the scrollwheel to jump",
    expect: {
      userName: "sinimurk",
      chatMsg: "the scrollwheel to jump",
      chanName: "#maya",
      directMsg: false,
    },
  };
  const test2: PrivTest = {
    test:
      `:apple12!apple12@apple12.tmi.twitch.tv PRIVMSG #ninja :this stream is pog`,
    expect: {
      userName: "apple12",
      chatMsg: `this stream is pog`,
      chanName: "#ninja",
      directMsg: false,
    },
  };

  for (const { test, expect } of [test1, test2]) {
    assertEquals(handlePrivMsg(test, user), expect);
  }
});

Deno.test("Detect ping messages", () => {
  const test1 = {
    test: "PING :tmi.twitch.tv",
    expect: true,
  };
  const test2 = {
    test:
      ":apple12!apple12@apple12.tmi.twitch.tv PRIVMSG #ninja :this stream is pog",
    expect: false,
  };

  for (const { test, expect } of [test1, test2]) {
    assertEquals(isPing(test), expect);
  }
});

Deno.test("Detect private messages", () => {
  const test1 = {
    test: "PING :tmi.twitch.tv",
    expect: false,
  };

  assertEquals(isPrivMsg(test1.test), test1.expect);
});

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
