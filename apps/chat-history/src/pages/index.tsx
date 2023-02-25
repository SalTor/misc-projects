import { useEffect, useState } from "react";

import { addMinutes, format, parseISO } from "date-fns";

import {
  isEventBundle,
  isMessageBundle,
  organizeActivity,
  randomEvent,
  randomMessage,
  sal,
  yuji,
} from "../helpers/chat-history";

export default function Web() {
  const [chatLog] = useState<ChatHistory>(
    organizeActivity([
      randomMessage({ user: sal }),
      randomMessage({ user: yuji }),
      randomEvent(),
      randomMessage({ user: yuji }),
      randomMessage({ user: yuji }),
      randomMessage({
        user: yuji,
        created_at: addMinutes(new Date(), 2).toISOString(),
      }),
    ])
  );
  useEffect(() => {
    console.log("chatLog", chatLog);
  }, [chatLog]);
  return (
    <div>
      <h1>Chat History</h1>
      <div>
        {chatLog.days.map((day) => (
          <section key={day.id}>
            <p>{format(parseISO(day.date), "MMMM d")}</p>
            {day.content.map((bundle) => (
              <div key={bundle.id}>
                {isMessageBundle(bundle) &&
                  bundle.content.map((message) => (
                    <p key={message.id}>
                      {message.user.name}: {message.message}
                    </p>
                  ))}
                {isEventBundle(bundle) &&
                  bundle.content.map((event) => (
                    <p
                      key={event.id}
                      data-relatedagent={event.assigned_agent.id}
                    >
                      {event.event}
                    </p>
                  ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
