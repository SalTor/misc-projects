import { useState } from "react";

import { format, parseISO } from "date-fns";

import { isEventBundle, isMessageBundle } from "../helpers/chat-history";

import serverChatHistory from "./chat-history";

export default function Web(props: { chatLog: ChatHistory }) {
  const [chatLog] = useState<ChatHistory>(props.chatLog);

  return (
    <div className="pt-5 overflow-y-scroll h-[200px]">
      {chatLog.days.map((day) => (
        <section
          key={day.id}
          className="max-w-[600px] mx-auto bg-[#efefef] p-5 relative"
        >
          <h2 className="sticky w-[130px] text-center top-0 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-black">
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
      chatLog: serverChatHistory,
    },
  };
}
