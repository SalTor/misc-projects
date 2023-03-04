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
 * Default selector for Npc.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultNpcSelect = Prisma.validator<Prisma.NpcSelect>()({
  id: true,
  name: true,
  known: true,
  forStory: true,
  campaignId: true,
});

export const npcRouter = router({
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;
      const npc = await prisma.npc.findUnique({
        where: { id },
        select: defaultNpcSelect,
      });
      if (!npc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No post with id '${id}'`,
        });
      }
      return npc;
    }),
  byCampaignId: publicProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { campaignId } = input;
      const npc = await prisma.npc.findMany({
        where: { campaignId },
        select: defaultNpcSelect,
      });
      if (!npc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No npc with id '${campaignId}'`,
        });
      }
      return npc;
    }),
  add: publicProcedure
    .input(
      z.object({
        campaignId: z.string().min(1),
        name: z.string().min(1).max(32),
        known: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const npc = await prisma.npc.create({
        data: input,
        select: defaultNpcSelect,
      });
      return npc;
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const response = await prisma.npc.delete({ where: { id: input.id } });
      return response;
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(32),
        known: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...withoutId } = input;
      console.log("update npc", input);
      const npc = await prisma.npc.update({
        where: { id: input.id },
        data: withoutId,
      });
      return npc;
    }),
});
