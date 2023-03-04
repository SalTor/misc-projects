import { AppProps } from "next/app";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";

import {
  AppShell,
  Header,
  MantineProvider,
  Navbar,
  NavLink,
} from "@mantine/core";
import { IconHammer, IconHome2 } from "@tabler/icons-react";

import LoginBtn from "../components/login-btn";

import "../styles/globals.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={new QueryClient()}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme: "light",
          }}
        >
          <AppShell
            padding="md"
            navbar={
              <Navbar width={{ base: 300 }} height={500} p="xs">
                <Link href="/">
                  <NavLink
                    label="Home"
                    icon={<IconHome2 size="1rem" stroke={1.5} />}
                  />
                </Link>
                <Link href="/campaigns">
                  <NavLink
                    label="Campaigns"
                    icon={<IconHammer size="1rem" stroke={1.5} />}
                  />
                </Link>
              </Navbar>
            }
            header={
              <Header height={60} p="xs">
                <LoginBtn />
              </Header>
            }
          >
            <Component {...pageProps} />
          </AppShell>
        </MantineProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
