import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import {useRouter} from 'next/router'

import { ObjectId } from "mongodb";

import clientPromise from "../../../lib/mongodb";

export default function CampaignPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter()
  const { campaign, npcs } = props;
  if (!campaign) return <h1>Not found</h1>;
  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">Title: {campaign.title}</h1>

      <article>
        <p>NPCs:</p>
      <Link href={'/campaigns/'+router.query.id+'/npcs/new'}>Create character</Link>

        <ul className="list-disc">

    {npcs?.length ? npcs?.map((n: Record<string, any>) => (
      <li key={n._id}>{n.name}</li>
    )) : (
      <li>
                <p>No NPCs entered</p></li>
    )}
        </ul>
      </article>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const campaign_id = new ObjectId(context.query.id as string)

    const client = await clientPromise;

    const db = client.db("campaigns");

    const [campaign] = await db
      .collection("campaigns")
      .find({ _id: campaign_id })
      .limit(1)
      .toArray();

    const npcs = await db.collection('npcs').find({campaign_id}).toArray();

    return {
      props: {
        campaign: JSON.parse(JSON.stringify(campaign)),
        npcs: JSON.parse(JSON.stringify(npcs)),
      },
    };
  } catch (error) {
    return {
      props: {
        campaign: null,
        npcs: []
      },
    };
  }
}
