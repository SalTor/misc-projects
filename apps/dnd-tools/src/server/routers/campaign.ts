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
 * Default selector for Campaign.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultCampaignSelect = Prisma.validator<Prisma.CampaignSelect>()({
  id: true,
  title: true,
});

export const campaignRouter = router({
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        select: defaultCampaignSelect,
      });
      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No campaign with id '${id}'`,
        });
      }
      return campaign;
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
      const campaign = await prisma.campaign.update({
        where: { id },
        data: withoutId,
      });
      return campaign;
    }),
  add: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(32),
      })
    )
    .mutation(async ({ input }) => {
      const campaign = await prisma.campaign.create({
        data: input,
        select: defaultCampaignSelect,
      });
      return campaign;
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const campaignId = input.id;
      const whereId = { where: { campaignId } };
      await prisma.npc.deleteMany(whereId);
      await prisma.player.deleteMany(whereId);
      await prisma.battle.deleteMany(whereId);
      const response = await prisma.campaign.delete({
        where: { id: campaignId },
      });
      return response;
    }),
});
