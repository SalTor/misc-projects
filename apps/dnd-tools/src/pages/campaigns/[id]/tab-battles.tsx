import Link from "next/link";
import { useState } from "react";

import {
  Anchor,
  Box,
  Button,
  Drawer,
  Flex,
  NumberInput,
  Space,
  Stack,
  Table,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Battle, Campaign } from "@prisma/client";
import { IconDeviceFloppy, IconLoader, IconTrash } from "@tabler/icons-react";
import { z } from "zod";

import { trpc } from "~/utils/trpc";

export default function TabsPlayers(props: {
  battles: Battle[];
  campaign: Campaign;
}) {
  const { campaign } = props;
  const [battles, setBattles] = useState(props.battles);

  const createBattleForm = useForm({
    initialValues: {
      campaignId: campaign.id,
      title: "",
    },
    validate: {
      title: (val) =>
        z.string().min(1).safeParse(val).success ? null : "Too short",
    },
  });
  const [
    showCreateBattle,
    { open: openCreateBattle, close: closeCreateBattle },
  ] = useDisclosure(false);
  const { mutate: createBattle, isLoading: isCreatingBattle } =
    trpc.battle.add.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setBattles((c) => {
            c.push(data);
            return c;
          });
          closeCreateBattle();
          createBattleForm.reset();
        }
      },
    });

  const editBattleForm = useForm<Battle>({
    initialValues: {
      id: "",
      title: "",
      campaignId: campaign.id,
    },
    validate: {
      title: (val) =>
        z.string().min(1).safeParse(val).success ? null : "Too short",
    },
  });
  const [showEditBattle, { open: openEditBattle, close: closeEditBattle }] =
    useDisclosure(false);
  const { mutate: updateBattle, isLoading: isUpdatingBattle } =
    trpc.battle.update.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setBattles((c) => c.map((_) => (_.id === data.id ? data : _)));
          closeEditBattle();
        }
      },
    });
  const { mutate: deleteBattle, isLoading: isDeletingBattle } =
    trpc.battle.delete.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setBattles((c) => c.filter((_) => _.id !== data.id));
          closeEditBattle();
        }
      },
    });

  return (
    <div>
      <Table withColumnBorders highlightOnHover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {battles.map((battle) => (
            <tr key={battle.id}>
              <td>{battle.title}</td>
              <td>
                <Flex>
                  <Anchor
                    onClick={() => {
                      editBattleForm.setValues(battle);
                      openEditBattle();
                    }}
                  >
                    Edit
                  </Anchor>
                  <Box p="md"></Box>
                  <Link
                    href={
                      "/campaigns/" + battle.campaignId + "/battle/" + battle.id
                    }
                  >
                    View
                  </Link>
                </Flex>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Space h="md" />

      <Button onClick={openCreateBattle}>Create Battle</Button>

      <Drawer opened={showEditBattle} onClose={closeEditBattle}>
        <form onSubmit={editBattleForm.onSubmit((vals) => updateBattle(vals))}>
          <Stack>
            <TextInput
              label="Title"
              {...editBattleForm.getInputProps("title")}
              required
              withAsterisk
            />

            <Button
              type="submit"
              rightIcon={
                isUpdatingBattle ? <IconLoader /> : <IconDeviceFloppy />
              }
              disabled={
                !editBattleForm.isValid() ||
                isUpdatingBattle ||
                isDeletingBattle
              }
            >
              Save
            </Button>

            <Button
              onClick={() => deleteBattle(editBattleForm.values)}
              color="red"
              rightIcon={isDeletingBattle ? <IconLoader /> : <IconTrash />}
              disabled={isDeletingBattle || isUpdatingBattle}
            >
              Delete
            </Button>
          </Stack>
        </form>
      </Drawer>

      <Drawer opened={showCreateBattle} onClose={closeCreateBattle}>
        <form
          onSubmit={createBattleForm.onSubmit((vals) => createBattle(vals))}
        >
          <Stack>
            <TextInput
              label="Title"
              required
              withAsterisk
              {...createBattleForm.getInputProps("title")}
            />

            <Button
              rightIcon={
                isCreatingBattle ? <IconLoader /> : <IconDeviceFloppy />
              }
              disabled={!createBattleForm.isValid() || isCreatingBattle}
              type="submit"
            >
              Save
            </Button>
          </Stack>
        </form>
      </Drawer>
    </div>
  );
}
