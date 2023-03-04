/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from "../trpc";

import { campaignRouter } from "./campaign";
import { npcRouter } from "./npc";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "yay!"),

  campaign: campaignRouter,
  npc: npcRouter,
});

export type AppRouter = typeof appRouter;
