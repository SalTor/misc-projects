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
 * Default selector for Monster.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultSelectMonster = Prisma.validator<Prisma.MonsterSelect>()({
  battleId: true,
  id: true,
  name: true,
  maxHp: true,
});

export const monsterRouter = router({
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;
      const monster = await prisma.monster.findUnique({
        where: { id },
        select: defaultSelectMonster,
      });
      if (!monster) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No monster with id '${id}'`,
        });
      }
      return monster;
    }),
  remove: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const result = await prisma.monster.delete({
        where: { id: input.id },
      });
      return result;
    }),
  add: publicProcedure
    .input(
      z.object({
        battleId: z.string().min(1),
        name: z.string().min(1),
        maxHp: z.number().min(0),
        initiative: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const { initiative, ...monsterData } = input;
      const monster = await prisma.monster.create({
        data: monsterData,
        select: defaultSelectMonster,
      });
      const participant = await prisma.battleParticipant.create({
        data: {
          battleId: monster.battleId,
          entityId: monster.id,
          entityType: "monster",
          initiative: input.initiative,
          damageTaken: 0,
          status: "alive",
        },
      });
      return { ...participant, entity: monster };
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
});
