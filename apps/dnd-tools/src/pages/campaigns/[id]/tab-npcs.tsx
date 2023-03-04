import { useState } from "react";

import {
  Anchor,
  Button,
  Checkbox,
  Drawer,
  Space,
  Stack,
  Table,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Campaign, Npc } from "@prisma/client";
import { IconDeviceFloppy, IconLoader, IconTrash } from "@tabler/icons-react";

import { trpc } from "~/utils/trpc";

export default function TabsNPCS(props: { npcs: Npc[]; campaign: Campaign }) {
  const { campaign } = props;
  const [npcs, setNpcs] = useState(props.npcs);

  const createNpcForm = useForm({
    initialValues: { campaignId: campaign.id, name: "", known: false },
    validate: {
      name: (val) => (!!val ? null : "Name required"),
    },
  });
  const [showCreateNpc, { open: startNpcCreation, close: discardNpcCreation }] =
    useDisclosure(false);
  const { mutate: createNpc, isLoading: isCreatingNpc } =
    trpc.npc.add.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setNpcs((c) => {
            c.push(data);
            return c;
          });
          discardNpcCreation();
          createNpcForm.reset();
        }
      },
    });

  const editNpcForm = useForm<Npc>({
    initialValues: {
      id: "",
      name: "",
      campaignId: "",
      forStory: false,
      known: false,
    },
    validate: {
      name: (val) => (!!val ? null : "Name required"),
    },
  });
  const [showEditNpc, { open: editNpc, close: discardNpcChanges }] =
    useDisclosure(false);
  const { mutate: updateNpc, isLoading: isUpdatingNpc } =
    trpc.npc.update.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setNpcs((c) => c.map((_) => (_.id === data.id ? data : _)));
          discardNpcChanges();
        }
      },
    });
  const { mutate: deleteNpc, isLoading: isDeletingNpc } =
    trpc.npc.delete.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setNpcs((c) => c.filter((_) => _.id !== data.id));
          discardNpcChanges();
        }
      },
    });
  return (
    <div>
      <Table withColumnBorders highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Players know them</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {npcs.map((npc) => (
            <tr key={npc.id}>
              <td>{npc.name}</td>
              <td>{npc.known ? "Yes" : "No"}</td>
              <td>
                <Anchor
                  onClick={() => {
                    editNpc();
                    editNpcForm.setValues(npc);
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

      <Button onClick={startNpcCreation}>Create NPC</Button>

      <Drawer opened={showEditNpc} onClose={discardNpcChanges}>
        <form onSubmit={editNpcForm.onSubmit((vals) => updateNpc(vals))}>
          <Stack>
            <TextInput
              label="Name"
              {...editNpcForm.getInputProps("name")}
              required
              withAsterisk
            />

            <Checkbox
              label="Known by players"
              {...editNpcForm.getInputProps("known", { type: "checkbox" })}
            />

            <Checkbox label="For the story (aka not a monster)" disabled />

            <Button
              type="submit"
              rightIcon={isUpdatingNpc ? <IconLoader /> : <IconDeviceFloppy />}
              disabled={!editNpcForm.isValid() || isUpdatingNpc}
            >
              Save
            </Button>

            <Button
              onClick={() => deleteNpc(editNpcForm.values)}
              color="red"
              rightIcon={isDeletingNpc ? <IconLoader /> : <IconTrash />}
              disabled={isDeletingNpc}
            >
              Delete
            </Button>
          </Stack>
        </form>
      </Drawer>

      <Drawer opened={showCreateNpc} onClose={discardNpcCreation}>
        <form onSubmit={createNpcForm.onSubmit((vals) => createNpc(vals))}>
          <Stack>
            <TextInput
              label="Name"
              required
              withAsterisk
              {...createNpcForm.getInputProps("name")}
            />
            <Checkbox
              label="Known by players"
              {...createNpcForm.getInputProps("known", { type: "checkbox" })}
            />
            <Checkbox
              label="For the story (aka not a monster)"
              checked
              disabled
            />
            <Button
              rightIcon={isCreatingNpc ? <IconLoader /> : <IconDeviceFloppy />}
              disabled={!createNpcForm.isValid() || isCreatingNpc}
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
