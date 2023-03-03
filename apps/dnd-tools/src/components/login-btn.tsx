import { signOut } from "next-auth/react";

import { Avatar, Box, Flex, Menu } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

export default function Component() {
  return (
    <Flex justify="end" align="center">
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Avatar radius="xl" />
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item icon={<IconLogout />}>
            <Box onClick={() => signOut()}>Sign out</Box>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Flex>
  );
}
