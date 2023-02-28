import { addMinutes, subDays } from "date-fns";

import {
  organizeActivity,
  randomEvent,
  randomMessage,
  sal,
  serializeHistory,
  yuji,
} from "./chat-history";

describe("ChatHistory", () => {
  test("Organizing a list of activity into a chat history", () => {
    const msg0 = randomMessage({
      user: sal,
      created_at: subDays(new Date(), 1).toISOString(),
    });
    const msg1 = randomMessage({ user: sal, message: "Message 1" });
    const msg2 = randomMessage({ user: yuji, message: "Message 2" });
    const evt1 = randomEvent();
    const msg3 = randomMessage({ user: yuji, message: "Message 3" });
    const msg4 = randomMessage({ user: yuji, message: "Message 4" });
    const msg5 = randomMessage({
      user: yuji,
      message: "Message 5",
      created_at: addMinutes(new Date(), 2).toISOString(),
    });

    const input = [msg0, msg1, msg2, evt1, msg3, msg4, msg5];
    const output = organizeActivity(input);

    const serialized = serializeHistory(output);
    const [fdate1, fdate2] = Object.keys(serialized.dates);
    const day1 = serialized.dates[fdate1];
    const day2 = serialized.dates[fdate2];

    expect(day1.bundles[1]).toStrictEqual({
      type: "message",
      length: 1,
      content: {
        1: msg0,
      },
    });

    expect(day2.bundles[1]).toStrictEqual({
      type: "message",
      length: 1,
      content: {
        1: msg1,
      },
    });

    expect(day2.bundles[2]).toStrictEqual({
      type: "message",
      length: 1,
      content: {
        1: msg2,
      },
    });

    expect(day2.bundles[3]).toStrictEqual({
      type: "event",
      length: 1,
      content: {
        1: evt1,
      },
    });

    expect(day2.bundles[4]).toStrictEqual({
      type: "message",
      length: 2,
      content: {
        1: msg3,
        2: msg4,
      },
    });

    expect(day2.bundles[5]).toStrictEqual({
      type: "message",
      length: 1,
      content: {
        1: msg5,
      },
    });
  });
});
