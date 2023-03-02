import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";

import LoginBtn from "../components/login-btn";
import clientPromise from "../lib/mongodb";

export async function getServerSideProps(context: GetServerSideProps) {
  try {
    await clientPromise;
    return {
      props: { isConnected: true },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        isConnected: false,
      },
    };
  }
}

export default function Web({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <Head>
        <title>DND Tools</title>
      </Head>
      <LoginBtn />
      {isConnected ? (
        <h2>You are connected to MongoDB</h2>
      ) : (
        <h2>
          You ase NOT connected to MongoDB. Check the <code>README.md</code> for
          instructions.
        </h2>
      )}
    </div>
  );
}
