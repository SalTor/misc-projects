import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Link from "next/link";

import clientPromise from "../../lib/mongodb";

export default function CampaignPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { campaigns } = props;
  if (!campaigns.length) return <h1>None found</h1>;
  return (
    <div className="p-5">
      <article>
        <h1 className="text-xl font-bold">Characters:</h1>

        <ul>
          {campaigns.map((c: Record<string, any>) => (
            <li key={c._id}>
              <Link href={'/campaigns/' + c._id} className="underline">{c.title}</Link>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("campaigns");
    const result = await db
      .collection("campaigns")
      .find({})
      .toArray();
    return {
      props: {
        campaigns: JSON.parse(JSON.stringify(result)),
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
