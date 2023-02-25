import { addMinutes, startOfDay } from "date-fns";

import {
  organizeActivity,
  randomEvent,
  randomMessage,
  sal,
  yuji,
} from "./chat-history";

describe("ChatHistory", () => {
  test("Organizing a list of activity into a chat history", () => {
    const msg1 = randomMessage({ user: sal });
    const msg2 = randomMessage({ user: yuji });
    const evt1 = randomEvent();
    const msg3 = randomMessage({ user: yuji });
    const msg4 = randomMessage({ user: yuji });
    const msg5 = randomMessage({
      user: yuji,
      created_at: addMinutes(new Date(), 2).toISOString(),
    });
    const input = [msg1, msg2, evt1, msg3, msg4, msg5];
    const output = organizeActivity(input);

    expect(output.days[0].date).toBe(startOfDay(new Date()).toISOString());

    expect(output.days[0].content[0].type).toBe("message");
    expect(output.days[0].content[0].content[0]).toBe(msg1);

    expect(output.days[0].content[1].type).toBe("message");
    expect(output.days[0].content[1].content[0]).toBe(msg2);

    expect(output.days[0].content[2].type).toBe("event");
    expect(output.days[0].content[2].content[0]).toBe(evt1);

    expect(output.days[0].content[3].type).toBe("message");
    expect(output.days[0].content[3].content[0]).toBe(msg3);
    expect(output.days[0].content[3].content[1]).toBe(msg4);
    expect(output.days[0].content[3].content[2]).toBe(undefined);

    expect(output.days[0].content[4].type).toBe("message");
    expect(output.days[0].content[4].content[0]).toBe(msg5);
  });
});
