import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import {useRouter} from 'next/router'
import { useState } from "react";
import { useMutation } from "react-query";

import { ObjectId } from "mongodb";

import clientPromise from "../../../../lib/mongodb";

export default function CampaignNPCsNew(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter()
  const [name, setName] = useState('')
  const {mutate:createNPC} = useMutation(async (name: string) => fetch('/api/campaigns/'+router.query.id+'/npcs/new', {
      method: 'POST',
      body: JSON.stringify({name}),
  }).then(res => res.json()), {
    onSettled(_, error) {
      if (error) return
      router.push('/campaigns/'+router.query.id)
    }
  })
  return (
    <div>
      <h1>Campaign: {props.campaign.title}</h1>
      <h2>Create new NPC!</h2>
      <input name="name" type="text" value={name} onChange={e => setName(e.target.value)}/>
      <button onClick={() => createNPC(name)}>Create NPC</button>
    </div>
  )
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

    return {
      props: {
        campaign: JSON.parse(JSON.stringify(campaign))
      }
    }
  } catch (error) {
    return {
      props: {
        campaign: null
      }
    }
  }
}
