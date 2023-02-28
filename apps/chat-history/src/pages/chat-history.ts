import { addMinutes, parseISO, subDays, subHours } from "date-fns";

import {
  organizeActivity,
  randomEvent,
  randomMessage,
  sal,
  yuji,
} from "../helpers/chat-history";

const _subDays =
  (days: number) =>
  (a: Activity): Activity => ({
    ...a,
    created_at: subDays(parseISO(a.created_at), days).toISOString(),
  });

export default organizeActivity([
  ...[
    randomMessage({
      user: sal,
      created_at: subHours(new Date(), 2).toISOString(),
    }),
    randomMessage({
      user: yuji,
      created_at: subHours(addMinutes(new Date(), 5), 1).toISOString(),
    }),
    randomMessage({
      user: yuji,
      created_at: addMinutes(new Date(), 5).toISOString(),
    }),
  ].map(_subDays(2)),
  ...[
    randomMessage({
      user: sal,
    }),
    randomMessage({
      user: yuji,
      created_at: addMinutes(new Date(), 5).toISOString(),
    }),
  ].map(_subDays(1)),
  randomMessage({ user: sal }),
  randomMessage({ user: yuji }),
  randomEvent(),
  randomMessage({ user: yuji }),
  randomMessage({ user: yuji }),
  randomMessage({
    user: yuji,
    created_at: addMinutes(new Date(), 2).toISOString(),
  }),
]);
