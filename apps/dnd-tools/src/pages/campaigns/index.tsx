import { InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "react-query";

import {
  Anchor,
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
import { Campaign, PrismaClient } from "@prisma/client";
import { IconLoader } from "@tabler/icons-react";

export default function CampaignPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  const { campaigns } = props;

  const [isCreateOpen, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const createForm = useForm({
    initialValues: {
      title: "",
    },
    validate: {
      title: (val) => (!!val ? null : "Title required"),
    },
  });

  const {
    mutate: createCampaign,
    isLoading: isCreating,
    isSuccess: didCreate,
  } = useMutation({
    mutationFn: async (values: Omit<Campaign, "id">) =>
      fetch("/api/campaigns/new", {
        method: "POST",
        body: JSON.stringify(values),
      }).then((res) => res.json()),
    onSettled(data, error) {
      if (error) return;
      router.push("/campaigns/" + data.id);
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

      <Drawer opened={isCreateOpen} onClose={closeCreate}>
        <form
          onSubmit={createForm.onSubmit((values) => createCampaign(values))}
        >
          <Stack>
            <TextInput label="Title" {...createForm.getInputProps("title")} />
            <Space h="md" />
            <Button
              type="submit"
              disabled={!createForm.isValid() || isCreating || didCreate}
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
    console.log("error", error);
    return {
      props: {
        campaigns: [],
      },
    };
  }
}
