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
 * Default selector for BattleParticipant.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultSelectBattleParticipant =
  Prisma.validator<Prisma.BattleParticipantSelect>()({
    battleId: true,
    id: true,
    initiative: true,
    entityId: true,
    entityType: true,
    damageTaken: true,
    status: true,
  });

export const EntityTypes = {
  player: "player",
  npc: "npc",
  monster: "monster",
} as const;
export const zEntityTypes = z.enum([
  EntityTypes.player,
  EntityTypes.npc,
  EntityTypes.monster,
]);
export const ParticipantStatuses = {
  alive: "alive",
  prone: "prone",
  dead: "dead",
} as const;
const zStatuses = z.enum([
  ParticipantStatuses.alive,
  ParticipantStatuses.prone,
  ParticipantStatuses.dead,
]);

export const battleParticipantRouter = router({
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;
      const participant = await prisma.battleParticipant.findUnique({
        where: { id },
        select: defaultSelectBattleParticipant,
      });
      if (!participant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No battle with id '${id}'`,
        });
      }
      return participant;
    }),
  byBattleId: publicProcedure
    .input(
      z.object({
        battleId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const { battleId } = input;
      const participants = await prisma.battleParticipant.findMany({
        where: { battleId },
        select: defaultSelectBattleParticipant,
      });
      if (!participants) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No battles with id '${battleId}'`,
        });
      }
      return participants;
    }),
  add: publicProcedure
    .input(
      z.object({
        battleId: z.string().min(1),
        initiative: z.number().min(0),
        entityType: zEntityTypes,
        entityId: z.string().min(1),
        status: zStatuses,
        damageTaken: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const participant = await prisma.battleParticipant.create({
        data: input,
        select: defaultSelectBattleParticipant,
      });
      return participant;
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const response = await prisma.battleParticipant.delete({
        where: { id: input.id },
      });
      return response;
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        battleId: z.string().min(1),
        initiative: z.number().min(0),
        entityType: zEntityTypes,
        entityId: z.string().min(1),
        status: zStatuses,
        damageTaken: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...withoutId } = input;
      console.log("update battleParticipant", input);
      const participant = await prisma.battleParticipant.update({
        where: { id: input.id },
        data: withoutId,
      });
      return participant;
    }),
});
