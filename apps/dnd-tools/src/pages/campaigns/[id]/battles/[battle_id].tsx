import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";

import { Anchor, Box, Breadcrumbs, Code, Table, Text } from "@mantine/core";
import {
  BattleParticipant,
  Monster,
  Npc,
  Player,
  PrismaClient,
} from "@prisma/client";

const statusToColor: Record<string, string> = {
  alive: "teal",
  dead: "red",
  prone: "orange",
};

export default function BattlePage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { battle, battleEntities } = props;
  const router = useRouter();

  if (!battle) return <h1>Battle not found</h1>;

  return (
    <div>
      <Breadcrumbs>
        <Text>Campaigns</Text>
        <Box w={100}>
          <Text truncate>{router.query.battle_id}</Text>
        </Box>
        <Text>Battles</Text>
        <Text>{battle.title}</Text>
      </Breadcrumbs>

      <Box w={600}>
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>Initiative</th>
              <th>Name</th>
              <th>Status</th>
              <th>ObjectID</th>
            </tr>
          </thead>
          <tbody>
            {battleEntities.map((battleEntity) =>
              battleEntity.entity ? (
                <tr key={battleEntity.id}>
                  <td>
                    <Anchor>Edit</Anchor>
                  </td>
                  <td>{battleEntity.initiative}</td>
                  <td>{battleEntity.entity.name}</td>
                  <td>
                    <Code color={statusToColor[battleEntity.status]}>
                      {battleEntity.status}
                    </Code>
                  </td>
                  <td>
                    <Code>{battleEntity.entityId}</Code>
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </Table>
      </Box>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const prisma = new PrismaClient();
  await prisma.$connect();

  const battleId = context.query.battle_id as string;
  try {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });
    const participants = await prisma.battleParticipant.findMany({
      where: { battleId },
      orderBy: { initiative: "desc" },
    });
    const entityData = await Promise.all(
      participants.map((participant) => {
        if (participant.entityType === "player") {
          return prisma.player.findUnique({
            where: { id: participant.entityId },
          });
        } else if (participant.entityType === "npc") {
          return prisma.npc.findUnique({
            where: { id: participant.entityId },
          });
        } else if (participant.entityType === "monster") {
          return prisma.monster.findUnique({
            where: { id: participant.entityId },
          });
        }
        return Promise.resolve(null);
      })
    );
    type BattleEntity = BattleParticipant & {
      entity: Player | Npc | Monster | null;
    };
    const battleEntities: BattleEntity[] = [];
    entityData
      .filter((val) => !!val)
      .forEach((entity, index) => {
        battleEntities.push({ ...participants[index], entity });
      });
    return {
      props: {
        battle,
        battleEntities,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      redirect: {
        destination: "/campaigns/" + context.query.id,
      },
    };
  }
}
