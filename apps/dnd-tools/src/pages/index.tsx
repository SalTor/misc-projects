import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";

import { Button } from "@mantine/core";

import { authOptions } from "./api/auth/[...nextauth]";

export default function Web({}: InferGetServerSidePropsType<
  typeof getServerSideProps
>) {
  return (
    <div>
      <Head>
        <title>DND Tools</title>
      </Head>

      <Button onClick={() => signIn()}>Sign in</Button>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );
    if (session) {
      return {
        redirect: {
          destination: "/campaigns",
          permanent: false,
        },
      };
    }
    return {
      props: { isConnected: true },
    };
  } catch (error) {
    return {
      props: {
        isConnected: false,
      },
    };
  }
}
