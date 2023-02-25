import { faker } from "@faker-js/faker";
import { differenceInSeconds, isSameDay, parseISO, startOfDay } from "date-fns";
import { v4 as uuid } from "uuid";

export const sal: User = {
  id: uuid(),
  name: "salt",
};
export const yuji: User = {
  id: uuid(),
  name: "yuji",
};

export const randomMessage = ({
  user,
  created_at,
}: {
  user?: User;
  created_at?: string;
}) =>
  ({
    id: uuid(),
    type: "message",
    user: user || {
      id: uuid(),
      name: faker.name.fullName(),
    },
    message: faker.lorem.sentence(),
    created_at: created_at || new Date().toISOString(),
  } as ChatMessage);

export const randomEvent = () =>
  ({
    id: uuid(),
    type: "event",
    event: "contact_assigned",
    assigned_agent: {
      id: uuid(),
      name: faker.name.fullName(),
    },
    created_at: new Date().toISOString(),
    contact: {
      id: uuid(),
    },
  } as ContactAssigned);

const isMessage = (activity: Activity): activity is ChatMessage =>
  activity.type === "message";

const isEvent = (activity: Activity): activity is ChatEvent =>
  activity.type === "event";

function genBundle(activity: Activity): EventBundle;
function genBundle(activity: Activity): MessageBundle;
function genBundle(activity: Activity) {
  if (isMessage(activity)) {
    return {
      id: uuid(),
      type: "message",
      content: [activity],
    } as MessageBundle;
  }
  if (isEvent(activity)) {
    return {
      id: uuid(),
      type: "event",
      content: [activity],
    } as EventBundle;
  }
}

export const isMessageBundle = (bundle: Bundle): bundle is MessageBundle =>
  bundle.type === "message";

export const isEventBundle = (bundle: Bundle): bundle is EventBundle =>
  bundle.type === "event";

export const organizeActivity = (activities: readonly Activity[]) => {
  const result: ChatHistory = {
    days: [],
  };
  activities.forEach((activity) => {
    const dayMatch = result.days.find((day) =>
      isSameDay(parseISO(day.date), parseISO(activity.created_at))
    );
    if (dayMatch) {
      let bundleMatch;
      const lastBundle = dayMatch.content.at(-1);
      if (lastBundle?.type === activity.type) {
        if (
          isMessage(activity) &&
          isMessageBundle(lastBundle) &&
          lastBundle.content.at(-1)?.user.id === activity.user.id
        ) {
          const thelast = lastBundle.content.at(-1);
          if (
            thelast
              ? differenceInSeconds(
                  parseISO(activity.created_at),
                  parseISO(thelast.created_at)
                ) < 60
              : false
          ) {
            bundleMatch = lastBundle as MessageBundle;
            bundleMatch.content.push(activity);
          } else {
            dayMatch.content.push(genBundle(activity));
          }
        } else if (isEvent(activity)) {
          bundleMatch = lastBundle as EventBundle;
          bundleMatch.content.push(activity);
        } else {
          dayMatch.content.push(genBundle(activity));
        }
      } else {
        dayMatch.content.push(genBundle(activity));
      }
    } else {
      result.days.push({
        id: uuid(),
        date: startOfDay(parseISO(activity.created_at)).toISOString(),
        content: [genBundle(activity)],
      });
    }
  });
  return result;
};
