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
 * Default selector for Player.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultPlayerSelect = Prisma.validator<Prisma.PlayerSelect>()({
  id: true,
  name: true,
  campaignId: true,
  maxHp: true,
  passiveWisdom: true,
});

export const playerRouter = router({
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;
      const player = await prisma.player.findUnique({
        where: { id },
        select: defaultPlayerSelect,
      });
      if (!player) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No post with id '${id}'`,
        });
      }
      return player;
    }),
  byCampaignId: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { campaignId } = input;
      const player = await prisma.player.findMany({
        where: { campaignId },
        select: defaultPlayerSelect,
      });
      if (!player) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No player with id '${campaignId}'`,
        });
      }
      return player;
    }),
  add: publicProcedure
    .input(
      z.object({
        campaignId: z.string().min(1),
        name: z.string().min(1).max(32),
        maxHp: z.number().min(0),
        passiveWisdom: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const player = await prisma.player.create({
        data: input,
        select: defaultPlayerSelect,
      });
      return player;
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const response = await prisma.player.delete({ where: { id: input.id } });
      return response;
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(32),
        maxHp: z.number().min(0),
        passiveWisdom: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...withoutId } = input;
      console.log("update player", input);
      const player = await prisma.player.update({
        where: { id: input.id },
        data: withoutId,
      });
      return player;
    }),
});
