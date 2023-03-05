/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { publicProcedure, router } from "../trpc";

import { prisma } from "~/server/prisma";

/**
 * Default selector for Battle.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultSelectBattle = Prisma.validator<Prisma.BattleSelect>()({
  campaignId: true,
  id: true,
  title: true,
});

export const battleRouter = router({
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;
      const battle = await prisma.battle.findUnique({
        where: { id },
        select: defaultSelectBattle,
      });
      if (!battle) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No battle with id '${id}'`,
        });
      }
      return battle;
    }),
  byCampaignId: publicProcedure
    .input(
      z.object({
        campaignId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const { campaignId } = input;
      const battles = await prisma.battle.findMany({
        where: { campaignId },
        select: defaultSelectBattle,
      });
      if (!battles) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No battles with id '${campaignId}'`,
        });
      }
      return battles;
    }),
  add: publicProcedure
    .input(
      z.object({
        campaignId: z.string().min(1),
        title: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const battle = await prisma.battle.create({
        data: input,
        select: defaultSelectBattle,
      });
      return battle;
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      await prisma.battleParticipant.deleteMany({
        where: { battleId: input.id },
      });
      const response = await prisma.battle.delete({ where: { id: input.id } });
      return response;
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...withoutId } = input;
      console.log("update battle", input);
      const battle = await prisma.battle.update({
        where: { id: input.id },
        data: withoutId,
      });
      return battle;
    }),
});
