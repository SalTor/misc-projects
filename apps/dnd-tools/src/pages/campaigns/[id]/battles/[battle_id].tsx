import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Code,
  Drawer,
  Flex,
  LoadingOverlay,
  NumberInput,
  Select,
  Space,
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
      entityType: "npc",
      entity: {
        name: "",
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
      onSettled(data, error) {
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

  const [createType, setCreateType] = useState("npc");
  const [
    showCreateParticipant,
    { open: openAddPlayerOrNPC, close: closeCreateParticipant },
  ] = useDisclosure(false);
  const createParticipantForm = useForm({
    initialValues: {
      battleId: battle.id,
      initiative: 0,
      status: "alive",
      damageTaken: 0,
      entityId: "1",
      entityType: "npc",
    },
    validate: {
      initiative: (val) =>
        z.number().safeParse(val).success ? null : "Too low",
      damageTaken: (val) =>
        z.number().safeParse(val).success ? null : "Too low",
    },
  });
  const { mutate: createParticipant, isLoading: isCreatingParticipant } =
    trpc.battleParticipant.add.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setBattleEntities((c) => {
            if (data.entity !== null) {
              c.push(data);
            }
            return c.sort((a, b) => b.initiative - a.initiative);
          });
        }
        closeCreateParticipant();
      },
    });

  const [showAddMonster, { open: openAddMonster, close: closeAddMonster }] =
    useDisclosure(false);
  const addMonsterForm = useForm({
    initialValues: {
      battleId: battle.id,
      maxHp: 0,
      name: "",
      initiative: 0,
    },
    validate: {
      name: (val) =>
        z.string().min(1).safeParse(val).success ? null : "Too short",
      maxHp: (val) =>
        z.number().min(0).safeParse(val).success ? null : "Too low",
      initiative: (val) =>
        z.number().min(0).safeParse(val).success ? null : "Too low",
    },
  });
  const { mutate: addMonster, isLoading: isAddingMonster } =
    trpc.monster.add.useMutation({
      onSettled(data, error, variables) {
        console.log("add monster to battle", variables);
        if (error) return;
        if (data) {
          setBattleEntities((c) => {
            if (data.entity !== null) {
              c.push(data);
            }
            return c.sort((a, b) => b.initiative - a.initiative);
          });
          closeAddMonster();
        }
      },
    });

  const {
    mutate: removeEntityFromBattle,
    isLoading: isRemovingEntityFromBattle,
  } = trpc.battleParticipant.remove.useMutation({
    onSettled(data, error, variables) {
      console.log("remove entity from battle", variables);
      if (error) return;
      if (data) {
        setBattleEntities((c) => c.filter((_) => _.id !== variables.id));
        closeEditParticipant();
      }
    },
  });

  const playerOptions = useMemo(() => {
    return props.players
      .map((p) => ({
        label: p.name,
        value: p.id,
      }))
      .filter((p) => !props.battleEntities.find((e) => e.entityId === p.value));
  }, [props.players, battleEntities]);

  const npcOptions = useMemo(() => {
    return props.npcs
      .map((p) => ({
        label: p.name,
        value: p.id,
      }))
      .filter((p) => !props.battleEntities.find((e) => e.entityId === p.value));
  }, [props.npcs, battleEntities]);

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
              <th>Damage taken</th>
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
                    <Code>{battleEntity.damageTaken}</Code>
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </Table>

        <Space h="md" />

        <Flex gap="md">
          <Button
            onClick={() => {
              setCreateType("npc");
              openAddPlayerOrNPC();
            }}
          >
            Add an NPC
          </Button>

          <Button
            onClick={() => {
              setCreateType("player");
              openAddPlayerOrNPC();
            }}
          >
            Add a Player
          </Button>

          <Button
            onClick={() => {
              openAddMonster();
            }}
          >
            Add a Monster
          </Button>
        </Flex>
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

              <NumberInput
                label="Damage taken"
                {...editParticipantForm.getInputProps("damageTaken")}
              />

              <Select
                label="Status"
                value={editParticipantForm.values.status}
                data={["alive" as const, "prone" as const, "dead" as const]}
                onChange={(val) => {
                  if (val !== null) {
                    editParticipantForm.setFieldValue("status", val);
                  }
                }}
              />

              <Button
                type="submit"
                disabled={isRemovingEntityFromBattle || isCreatingParticipant}
              >
                Save
              </Button>

              <Button
                onClick={() =>
                  removeEntityFromBattle({ id: editParticipantForm.values.id })
                }
                disabled={isRemovingEntityFromBattle || isCreatingParticipant}
                color="red"
              >
                Remove from battle
              </Button>

              <Button
                onClick={closeEditParticipant}
                color="gray"
                disabled={isRemovingEntityFromBattle || isCreatingParticipant}
              >
                Cancel
              </Button>
            </Stack>
          </form>
        </Box>
      </Drawer>

      <Drawer
        opened={showCreateParticipant}
        onClose={() => {
          closeCreateParticipant();
          createParticipantForm.reset();
        }}
      >
        <Box pos="relative">
          <LoadingOverlay visible={isCreatingParticipant} />
          <form
            onSubmit={createParticipantForm.onSubmit((vals) =>
              createParticipant(vals)
            )}
          >
            <Stack>
              {/*
          need to show an entity search .. which will filter by Player or NPC ... or needs to allow the creation of a monster! maybe that last part can be a separate form ..
         */}
              {createType === "npc" && (
                <Select
                  label="NPC"
                  data={npcOptions}
                  onChange={(val) => {
                    if (val) {
                      createParticipantForm.setFieldValue("entityType", "npc");
                      createParticipantForm.setFieldValue("entityId", val);
                    }
                  }}
                />
              )}

              {createType === "player" && (
                <Select
                  label="Player"
                  data={playerOptions}
                  onChange={(val) => {
                    if (val) {
                      createParticipantForm.setFieldValue(
                        "entityType",
                        "player"
                      );
                      createParticipantForm.setFieldValue("entityId", val);
                    }
                  }}
                />
              )}

              <NumberInput
                label="Initiative"
                {...createParticipantForm.getInputProps("initiative")}
              />

              <Select
                label="Status"
                value={createParticipantForm.values.status}
                data={["alive" as const, "prone" as const, "dead" as const]}
                onChange={(val) => {
                  if (val !== null) {
                    createParticipantForm.setFieldValue("status", val);
                  }
                }}
              />

              <Button type="submit">Save</Button>

              <Button
                onClick={() => {
                  closeCreateParticipant();
                  createParticipantForm.reset();
                }}
                color="gray"
              >
                Cancel
              </Button>
            </Stack>
          </form>
        </Box>
      </Drawer>

      <Drawer
        opened={showAddMonster}
        onClose={() => {
          closeAddMonster();
          addMonsterForm.reset();
        }}
      >
        <Box pos="relative">
          <LoadingOverlay visible={isCreatingParticipant} />
          <form onSubmit={addMonsterForm.onSubmit((vals) => addMonster(vals))}>
            <Stack>
              <TextInput
                label="Name"
                {...addMonsterForm.getInputProps("name")}
              />

              <NumberInput
                label="Max HP"
                {...addMonsterForm.getInputProps("maxHp")}
              />

              <NumberInput
                label="Initiative"
                {...addMonsterForm.getInputProps("initiative")}
              />

              <Button type="submit" disabled={isAddingMonster}>
                Add monster
              </Button>

              <Button onClick={closeAddMonster} disabled={isAddingMonster}>
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
    const campaignId = context.query.id as string;
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });
    if (!battle) {
      return {
        redirect: {
          destination: "/campaigns/" + context.query.id,
        },
      };
    }

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
    const players = await prisma.player.findMany({ where: { campaignId } });
    const npcs = await prisma.npc.findMany({ where: { campaignId } });
    return {
      props: {
        battle,
        battleEntities,
        players,
        npcs,
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
