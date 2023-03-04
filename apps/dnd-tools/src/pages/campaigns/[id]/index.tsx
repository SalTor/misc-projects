import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

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
import {
  IconDeviceFloppy,
  IconLoader,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import { trpc } from "~/utils/trpc";

export default function CampaignPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const [campaign, setCampaign] = useState(props.campaign);
  const [npcs, setNpcs] = useState(props.npcs);

  const router = useRouter();

  const editCampaignForm = useForm({
    initialValues: { id: campaign.id, title: campaign.title },
    validate: { title: (val) => (!val ? "Title nedded" : null) },
  });
  const [
    showEditCampaign,
    { open: openEditCampaign, close: closeEditCampaign },
  ] = useDisclosure(false);
  const { mutate: updateCampaign, isLoading: isUpdatingCampaign } =
    trpc.campaign.update.useMutation({
      onSettled(data, error) {
        if (error) return;
        if (data) {
          setCampaign(data);
          closeEditCampaign();
        }
      },
    });
  const deleteCampaignForm = useForm({
    initialValues: { id: "", title: "" },
    validate: {
      id: (val) => (val === campaign.id ? null : "Campaign ID does not match"),
      title: (val) =>
        val === campaign.title ? null : "Campaign title does not match",
    },
  });
  const [
    showDeleteCampaign,
    { open: openDeleteCampaign, close: closeDeleteCampaign },
  ] = useDisclosure(false);
  const {
    mutate: deleteCampaign,
    isLoading: isDeletingCampaign,
    isSuccess: didDeleteCampaign,
  } = trpc.campaign.delete.useMutation({
    onSettled(_, error) {
      if (error) return;
      router.push("/campaigns");
    },
  });

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
      <Container ml="xs" mt="md">
        <Breadcrumbs>
          <Text>Campaigns</Text>
          <Anchor onClick={openEditCampaign}>
            <Text td="underline">
              {campaign.title} <IconPencil size="1rem" stroke={1.5} />
            </Text>
          </Anchor>
        </Breadcrumbs>

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
      </Container>

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

      <Drawer opened={showEditCampaign} onClose={closeEditCampaign}>
        <form
          onSubmit={editCampaignForm.onSubmit((vals) => updateCampaign(vals))}
        >
          <Stack>
            <TextInput
              label="Name"
              {...editCampaignForm.getInputProps("title")}
              required
              withAsterisk
              disabled={isUpdatingCampaign || showDeleteCampaign}
            />

            <Button
              type="submit"
              rightIcon={
                isUpdatingCampaign ? <IconLoader /> : <IconDeviceFloppy />
              }
              disabled={
                !editCampaignForm.isValid() ||
                isUpdatingCampaign ||
                showDeleteCampaign
              }
            >
              Save
            </Button>

            <Button
              onClick={openDeleteCampaign}
              color="red"
              disabled={isUpdatingCampaign || showDeleteCampaign}
            >
              Delete
            </Button>
          </Stack>
        </form>

        <Modal
          opened={showDeleteCampaign}
          onClose={() => {
            closeDeleteCampaign();
            deleteCampaignForm.reset();
          }}
          title="Delete campaign"
        >
          <form
            onSubmit={deleteCampaignForm.onSubmit(() =>
              deleteCampaign({ id: campaign.id })
            )}
          >
            <Text>Confirm campaign details to delete</Text>

            <Space h="md" />

            <TextInput
              label="Campaign ID"
              {...deleteCampaignForm.getInputProps("id")}
            />

            <TextInput
              label="Campaign title"
              {...deleteCampaignForm.getInputProps("title")}
            />

            <Space h="md" />

            <Button
              color="red"
              type="submit"
              disabled={
                !deleteCampaignForm.isValid() ||
                isDeletingCampaign ||
                didDeleteCampaign
              }
              rightIcon={isDeletingCampaign ? <IconLoader /> : null}
            >
              Confirm
            </Button>

            <Space h="md" />

            <Button
              onClick={() => {
                closeDeleteCampaign();
                deleteCampaignForm.reset();
              }}
              disabled={isDeletingCampaign || didDeleteCampaign}
            >
              Cancel
            </Button>
          </form>
        </Modal>
      </Drawer>
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
