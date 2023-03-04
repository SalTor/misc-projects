import { InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import {
  Button,
  Container,
  Drawer,
  Space,
  Stack,
  Table,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { PrismaClient } from "@prisma/client";
import { IconLoader } from "@tabler/icons-react";

import { trpc } from "~/utils/trpc";

export default function CampaignPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(props.campaigns);

  const createCampaignForm = useForm({
    initialValues: {
      title: "",
    },
    validate: {
      title: (val) => (!!val ? null : "Title required"),
    },
  });
  const [showCreateCampaign, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const {
    mutate: createCampaign,
    isLoading: isCreating,
    isSuccess: didCreate,
  } = trpc.campaign.add.useMutation({
    onSettled(data, error) {
      if (error) return;
      if (data) {
        setCampaigns((c) => {
          c.push(data);
          return c;
        });
        router.push("/campaigns/" + data.id);
      }
    },
  });

  return (
    <div className="p-5">
      <Button onClick={openCreate}>Create campaign</Button>

      <Space h="md" />

      <Container ml="xs" mt="md">
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>{campaign.title}</td>
                <td>
                  <Link href={"/campaigns/" + campaign.id}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Drawer opened={showCreateCampaign} onClose={closeCreate}>
        <form
          onSubmit={createCampaignForm.onSubmit((values) =>
            createCampaign(values)
          )}
        >
          <Stack>
            <TextInput
              label="Title"
              {...createCampaignForm.getInputProps("title")}
            />
            <Space h="md" />
            <Button
              type="submit"
              disabled={
                !createCampaignForm.isValid() || isCreating || didCreate
              }
              rightIcon={isCreating ? <IconLoader /> : null}
            >
              Save
            </Button>
          </Stack>
        </form>
      </Drawer>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const campaigns = await prisma.campaign.findMany();

    return {
      props: {
        campaigns,
      },
    };
  } catch (error) {
    return {
      props: {
        campaigns: [],
      },
    };
  }
}
