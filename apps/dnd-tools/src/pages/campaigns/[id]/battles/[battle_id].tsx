import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Code,
  Drawer,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  BattleParticipant,
  Monster,
  Npc,
  Player,
  PrismaClient,
} from "@prisma/client";
import { z } from "zod";

import { trpc } from "~/utils/trpc";

const statusToColor: Record<string, string> = {
  alive: "teal",
  dead: "red",
  prone: "orange",
};

export default function BattlePage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { battle } = props;
  const router = useRouter();

  const [battleEntities, setBattleEntities] = useState(props.battleEntities);

  const [
    showEditParticipant,
    { open: openEditParticipant, close: closeEditParticipant },
  ] = useDisclosure(false);
  const editParticipantForm = useForm({
    initialValues: {
      id: "1",
      battleId: "1",
      initiative: 0,
      status: "alive",
      damageTaken: 0,
      entityId: "1",
      entityType: "",
      entity: {
        name: "Sal",
      },
    },
    validate: {
      initiative: (val) =>
        z.number().safeParse(val).success ? null : "Too low",
      damageTaken: (val) =>
        z.number().safeParse(val).success ? null : "Too low",
    },
  });
  const { mutate: updateParticipant, isLoading: isUpdatingParticipant } =
    trpc.battleParticipant.update.useMutation({
      onSettled(data, error, variables) {
        console.log("update? participant", { data, error, variables });
        if (error) return;
        if (data) {
          setBattleEntities((c) =>
            c
              .map((_) => (_.id === data.id ? { ..._, ...data } : _))
              .sort((a, b) => b.initiative - a.initiative)
          );
        }
        closeEditParticipant();
      },
    });

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
                    <Anchor
                      onClick={() => {
                        editParticipantForm.setValues(battleEntity);
                        openEditParticipant();
                      }}
                    >
                      Edit
                    </Anchor>
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

      <Drawer opened={showEditParticipant} onClose={closeEditParticipant}>
        <Box pos="relative">
          <LoadingOverlay visible={isUpdatingParticipant} />
          <form
            onSubmit={editParticipantForm.onSubmit((val) =>
              updateParticipant(val)
            )}
          >
            <Stack>
              <TextInput
                label="Name"
                disabled
                value={editParticipantForm.values.entity.name}
              />

              <NumberInput
                label="Initiative"
                {...editParticipantForm.getInputProps("initiative")}
              />

              <Select
                label="Status"
                value={editParticipantForm.values.status}
                data={["alive", "prone", "dead"]}
                onChange={(val) => {
                  if (val !== null) {
                    editParticipantForm.setFieldValue("status", val);
                  }
                }}
              />

              <Button type="submit">Save</Button>

              <Button onClick={closeEditParticipant} color="gray">
                Cancel
              </Button>
            </Stack>
          </form>
        </Box>
      </Drawer>
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
      entity: Player | Npc | Monster;
    };
    const battleEntities: BattleEntity[] = [];
    entityData
      .filter((val) => !!val)
      .forEach((entity, index) => {
        if (entity === null) return;
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
