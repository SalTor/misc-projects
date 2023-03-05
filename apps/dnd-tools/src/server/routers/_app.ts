/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from "../trpc";

import { battleRouter } from "./battle";
import { campaignRouter } from "./campaign";
import { npcRouter } from "./npc";
import { playerRouter } from "./player";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "yay!"),

  campaign: campaignRouter,
  npc: npcRouter,
  player: playerRouter,
  battle: battleRouter,
});

export type AppRouter = typeof appRouter;
