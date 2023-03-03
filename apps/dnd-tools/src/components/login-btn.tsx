import { signIn, signOut, useSession } from "next-auth/react";

import {
  Avatar,
  Button,
  Container,
  Flex,
  Menu,
  UnstyledButton,
} from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

export default function Component() {
  const { data: session } = useSession();
  if (session) {
    return (
      <Flex justify="end" align="center">
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Avatar radius="xl" />
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item icon={<IconLogout />}>
              <UnstyledButton onClick={() => signOut()}>
                Sign out
              </UnstyledButton>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
