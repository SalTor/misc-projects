import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation } from "react-query";

import {
  Anchor,
  Breadcrumbs,
  Button,
  Checkbox,
  Container,
  Divider,
  Drawer,
  Modal,
  Space,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Npc, PrismaClient } from "@prisma/client";
import { IconDeviceFloppy, IconLoader, IconTrash } from "@tabler/icons-react";

type NpcCreation = Partial<Omit<Npc, "id|campaignId">>;

export default function CampaignPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { campaign, npcs } = props;

  const router = useRouter();

  const [editingNpc, setEditingNpc] = useState<Npc>();
  const createNpcForm = useForm({
    initialValues: { name: "", known: false },
    validate: {
      name: (val) => (!!val ? null : "Name required"),
    },
  });
  const deleteForm = useForm({
    initialValues: { campaignId: "", title: "" },
    validate: {
      campaignId: (val) =>
        val === campaign.id ? null : "Campaign ID does not match",
      title: (val) =>
        val === campaign.title ? null : "Campaign title does not match",
    },
  });

  const [isEditingNpc, { open: editNpc, close: discardNpcChanges }] =
    useDisclosure(false);
  const [
    shouldCreateNpc,
    { open: startCreatinNpc, close: discardNpcCreation },
  ] = useDisclosure(false);
  const [showDelete, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const {
    mutate: updateNpc,
    isLoading,
    isSuccess,
  } = useMutation({
    mutationFn: async (npcToUpdate: Npc) =>
      fetch("/api/campaigns/" + campaign.id + "/npcs/" + npcToUpdate.id, {
        method: "PUT",
        body: JSON.stringify(npcToUpdate),
      }),
    onSettled(_, error) {
      if (error) return; // TODO: handle error states
      router.reload();
    },
  });

  const {
    mutate: createNpc,
    isLoading: isCreatingNpc,
    isSuccess: didCreateNpc,
  } = useMutation({
    mutationFn: async (data: NpcCreation) =>
      fetch("/api/campaigns/" + campaign.id + "/npcs/new", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSettled(_, error) {
      if (error) return; // TODO: handle error states
      router.reload();
    },
  });

  const {
    mutate: deleteNpc,
    isLoading: isDeletingNpc,
    isSuccess: didDeleteNpc,
  } = useMutation({
    mutationFn: async (npc: Npc) =>
      fetch("/api/campaigns/" + campaign.id + "/npcs/" + npc.id, {
        method: "DELETE",
      }),
    onSettled(_, error) {
      if (error) return;
      router.reload();
    },
  });

  const saveEditingNpcChanges = () => {
    if (!editingNpc) return;
    updateNpc(editingNpc);
  };

  const {
    mutate: deleteCampaign,
    isLoading: isDeletingCampaign,
    isSuccess: didDeleteCampaign,
  } = useMutation({
    mutationFn: async () =>
      fetch("/api/campaigns/" + campaign.id, {
        method: "DELETE",
      }).then((res) => res.json()),
    onSettled(_, error) {
      if (error) return; // TODO
      router.push("/campaigns");
    },
  });

  return (
    <div>
      <Container ml="xs" mt="md">
        <Breadcrumbs>
          <Text>Campaigns</Text>
          <Text>{campaign.title}</Text>
        </Breadcrumbs>

        <Space h="md" />

        <Button onClick={startCreatinNpc}>Create NPC</Button>

        <Space h="md" />

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
                      setEditingNpc(npc);
                    }}
                  >
                    Edit
                  </Anchor>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Divider my="xl" />
        <Text color="red">Danger zone</Text>
        <Space h="lg" />
        <Button onClick={openDelete} color="red">
          Delete campaign
        </Button>
      </Container>

      <Drawer opened={isEditingNpc} onClose={discardNpcChanges}>
        {editingNpc && (
          <Stack>
            <TextInput
              label="Name"
              value={editingNpc.name}
              onChange={(e) =>
                setEditingNpc({ ...editingNpc, name: e.target.value })
              }
              required
              withAsterisk
            />

            <Checkbox
              label="Known by players"
              checked={editingNpc.known}
              onChange={() =>
                setEditingNpc({ ...editingNpc, known: !editingNpc.known })
              }
            />

            <Checkbox label="For the story (aka not a monster)" disabled />

            <Button
              onClick={saveEditingNpcChanges}
              rightIcon={isLoading ? <IconLoader /> : <IconDeviceFloppy />}
              disabled={isLoading || isSuccess}
            >
              Save
            </Button>

            <Button
              onClick={() => deleteNpc(editingNpc)}
              color="red"
              rightIcon={isDeletingNpc ? <IconLoader /> : <IconTrash />}
              disabled={isDeletingNpc || didDeleteNpc}
            >
              Delete
            </Button>
          </Stack>
        )}
      </Drawer>

      <Drawer opened={shouldCreateNpc} onClose={discardNpcCreation}>
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
              disabled={isCreatingNpc || didCreateNpc}
              type="submit"
            >
              Save
            </Button>
          </Stack>
        </form>
      </Drawer>

      <Modal
        opened={showDelete}
        onClose={() => {
          closeDelete();
          deleteForm.reset();
        }}
        title="Delete campaign"
      >
        <form onSubmit={deleteForm.onSubmit(() => deleteCampaign())}>
          <Text>Confirm campaign details to delete</Text>

          <Space h="md" />

          <TextInput
            label="Campaign ID"
            {...deleteForm.getInputProps("campaignId")}
          />

          <TextInput
            label="Campaign title"
            {...deleteForm.getInputProps("title")}
          />

          <Space h="md" />

          <Button
            color="red"
            type="submit"
            disabled={
              !deleteForm.isValid() || isDeletingCampaign || didDeleteCampaign
            }
            rightIcon={isDeletingCampaign ? <IconLoader /> : null}
          >
            Confirm
          </Button>

          <Space h="md" />

          <Button
            onClick={() => {
              closeDelete();
              deleteForm.reset();
            }}
          >
            Cancel
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const campaignId = context.query.id as string;

    const prisma = new PrismaClient();
    await prisma.$connect();

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
      },
    });
    const npcs = await prisma.npc.findMany({ where: { campaignId } });

    if (!campaign) {
      return {
        redirect: {
          destination: "/campaigns",
        },
      };
    }

    return {
      props: {
        campaign,
        npcs,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/campaigns",
      },
    };
  }
}
