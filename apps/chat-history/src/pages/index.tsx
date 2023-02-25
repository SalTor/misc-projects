import { useState } from "react";

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

export default function Web(props: { chatLog: ChatHistory }) {
  const [chatLog] = useState<ChatHistory>(props.chatLog);

  return (
    <div className="pt-5">
      {chatLog.days.map((day) => (
        <section
          key={day.id}
          className="max-w-[600px] mx-auto bg-[#efefef] p-5"
        >
          <h2 className="text-center font-bold text-xl">
            {format(parseISO(day.date), "MMMM d")}
          </h2>
          {day.content.map((bundle) => (
            <div key={bundle.id}>
              {isMessageBundle(bundle) && (
                <>
                  <p className="font-bold">
                    {format(parseISO(bundle.content[0].created_at), "hh:mm a")}:{" "}
                    {bundle.content[0].user.name}
                  </p>
                  {bundle.content.map((message) => (
                    <p key={message.id} className="ml-3">
                      {message.message}
                    </p>
                  ))}
                </>
              )}
              {isEventBundle(bundle) &&
                bundle.content.map((event) => (
                  <div key={event.id} className="my-3">
                    <pre data-relatedagent={event.assigned_agent.id}>
                      - - - {event.event} - - -
                    </pre>
                  </div>
                ))}
            </div>
          ))}
        </section>
      ))}{" "}
    </div>
  );
}

export function getStaticProps() {
  return {
    props: {
      chatLog: organizeActivity([
        randomMessage({ user: sal }),
        randomMessage({ user: yuji }),
        randomEvent(),
        randomMessage({ user: yuji }),
        randomMessage({ user: yuji }),
        randomMessage({
          user: yuji,
          created_at: addMinutes(new Date(), 2).toISOString(),
        }),
      ]),
    },
  };
}
