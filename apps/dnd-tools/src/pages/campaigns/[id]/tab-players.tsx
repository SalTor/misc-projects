import { useState } from "react";

import {
  Anchor,
  Button,
  Drawer,
  NumberInput,
  Space,
  Stack,
  Table,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Campaign, Player } from "@prisma/client";
import { IconDeviceFloppy, IconLoader, IconTrash } from "@tabler/icons-react";
import { z } from "zod";

import { trpc } from "~/utils/trpc";

export default function TabsPlayers(props: {
  players: Player[];
  campaign: Campaign;
}) {
  const { campaign } = props;
  const [players, setPlayers] = useState(props.players);

  const createPlayerForm = useForm({
    initialValues: {
      campaignId: campaign.id,
      name: "",
      maxHp: 0,
      passiveWisdom: 0,
    },
    validate: {
      name: (val) => (!!val ? null : "Name required"),
      maxHp: (val) =>
        z.number().min(0).safeParse(val).success ? null : "Too low",
      passiveWisdom: (val) =>
        z.number().min(0).safeParse(val).success ? null : "Too low",
    },
  });
  const [
    showCreatePlayer,
    { open: startPlayerCreation, close: discardPlayerCreation },
  ] = useDisclosure(false);
  const { mutate: createPlayer, isLoading: isCreatingPlayer } =
    trpc.player.add.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setPlayers((c) => {
            c.push(data);
            return c;
          });
          discardPlayerCreation();
          createPlayerForm.reset();
        }
      },
    });

  const editPlayerForm = useForm<Player>({
    initialValues: {
      id: "",
      name: "",
      campaignId: "",
      maxHp: 0,
      passiveWisdom: 0,
    },
    validate: {
      name: (val) => (!!val ? null : "Name required"),
      maxHp: (val) =>
        z.number().min(0).safeParse(val).success ? null : "Too low",
      passiveWisdom: (val) =>
        z.number().min(0).safeParse(val).success ? null : "Too low",
    },
  });
  const [showEditPlayer, { open: editPlayer, close: discardPlayerChanges }] =
    useDisclosure(false);
  const { mutate: updatePlayer, isLoading: isUpdatingPlayer } =
    trpc.player.update.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setPlayers((c) => c.map((_) => (_.id === data.id ? data : _)));
          discardPlayerChanges();
        }
      },
    });
  const { mutate: deletePlayer, isLoading: isDeletingPlayer } =
    trpc.player.delete.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setPlayers((c) => c.filter((_) => _.id !== data.id));
          discardPlayerChanges();
        }
      },
    });

  return (
    <div>
      <Table withColumnBorders highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Max HP</th>
            <th>Passive Wisdom</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{player.maxHp}</td>
              <td>{player.passiveWisdom}</td>
              <td>
                <Anchor
                  onClick={() => {
                    editPlayer();
                    editPlayerForm.setValues(player);
                  }}
                >
                  Edit
                </Anchor>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Space h="md" />

      <Button onClick={startPlayerCreation}>Create Player</Button>

      <Drawer opened={showEditPlayer} onClose={discardPlayerChanges}>
        <form onSubmit={editPlayerForm.onSubmit((vals) => updatePlayer(vals))}>
          <Stack>
            <TextInput
              label="Name"
              {...editPlayerForm.getInputProps("name")}
              required
              withAsterisk
            />

            <NumberInput
              label="Max HP"
              required
              withAsterisk
              {...editPlayerForm.getInputProps("maxHp")}
            />

            <NumberInput
              label="Passive wisdom"
              required
              withAsterisk
              {...editPlayerForm.getInputProps("passiveWisdom")}
            />

            <Button
              type="submit"
              rightIcon={
                isUpdatingPlayer ? <IconLoader /> : <IconDeviceFloppy />
              }
              disabled={!editPlayerForm.isValid() || isUpdatingPlayer}
            >
              Save
            </Button>

            <Button
              onClick={() => deletePlayer(editPlayerForm.values)}
              color="red"
              rightIcon={isDeletingPlayer ? <IconLoader /> : <IconTrash />}
              disabled={isDeletingPlayer}
            >
              Delete
            </Button>
          </Stack>
        </form>
      </Drawer>

      <Drawer opened={showCreatePlayer} onClose={discardPlayerCreation}>
        <form
          onSubmit={createPlayerForm.onSubmit((vals) => createPlayer(vals))}
        >
          <Stack>
            <TextInput
              label="Name"
              required
              withAsterisk
              {...createPlayerForm.getInputProps("name")}
            />

            <NumberInput
              label="Max MP"
              required
              withAsterisk
              {...createPlayerForm.getInputProps("maxHp")}
            />

            <NumberInput
              label="Passive wisdom"
              required
              withAsterisk
              {...createPlayerForm.getInputProps("passiveWisdom")}
            />

            <Button
              rightIcon={
                isCreatingPlayer ? <IconLoader /> : <IconDeviceFloppy />
              }
              disabled={!createPlayerForm.isValid() || isCreatingPlayer}
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
