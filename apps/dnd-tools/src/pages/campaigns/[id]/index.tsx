import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import {
  Anchor,
  Breadcrumbs,
  Button,
  Container,
  Drawer,
  Modal,
  Space,
  Stack,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { PrismaClient } from "@prisma/client";
import {
  IconDeviceFloppy,
  IconLoader,
  IconMan,
  IconPencil,
  IconRobot,
  IconSword,
} from "@tabler/icons-react";

import BattlesTab from "./tab-battles";
import NPCsTab from "./tab-npcs";
import PlayersTab from "./tab-players";

import { trpc } from "~/utils/trpc";

export default function CampaignPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const [campaign, setCampaign] = useState(props.campaign);

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
          setCampaign((c) => ({ ...c, ...data }));
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

        <Tabs defaultValue="npcs">
          <Tabs.List>
            <Tabs.Tab value="npcs" icon={<IconRobot />}>
              NPCs
            </Tabs.Tab>
            <Tabs.Tab value="players" icon={<IconMan />}>
              Players
            </Tabs.Tab>
            <Tabs.Tab value="battles" icon={<IconSword />}>
              Battles
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="npcs" pt="xs">
            <NPCsTab npcs={campaign.npcs} campaign={campaign} />
          </Tabs.Panel>
          <Tabs.Panel value="players" pt="xs">
            <PlayersTab players={campaign.players} campaign={campaign} />
          </Tabs.Panel>
          <Tabs.Panel value="battles" pt="xs">
            <BattlesTab battles={campaign.battles} campaign={campaign} />
          </Tabs.Panel>
        </Tabs>
      </Container>

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
      include: {
        players: true,
        npcs: true,
        battles: true,
      },
    });

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
