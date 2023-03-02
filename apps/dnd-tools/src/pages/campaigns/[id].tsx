import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

import { ObjectId } from "mongodb";

import clientPromise from "../../lib/mongodb";

export default function CampaignPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { campaign } = props;
  if (!campaign) return <h1>Not found</h1>;
  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">Title: {campaign.title}</h1>

      <article>
        <p>Characters:</p>

        <ul>
          <li>None found</li>
        </ul>
      </article>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const client = await clientPromise;
    const db = client.db("campaigns");
    const [result] = await db
      .collection("campaigns")
      .find({ _id: new ObjectId(context.query.id as string) })
      .limit(1)
      .toArray();
    return {
      props: {
        campaign: JSON.parse(JSON.stringify(result)),
      },
    };
  } catch (error) {
    console.log("error", error);
    return {
      props: {
        campaign: null,
      },
    };
  }
}
