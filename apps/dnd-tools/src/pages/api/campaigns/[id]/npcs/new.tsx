import { NextApiRequest, NextApiResponse } from "next";

import { ObjectId } from "mongodb";

import clientPromise from "../../../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(400).json({ message: 'Only POST accepted'})

  try {
    const client = await clientPromise;
    const db = client.db("campaigns");
    const body = JSON.parse(req.body)

    const result = await db
      .collection("npcs")
      .insertOne({...body, campaign_id: new ObjectId(req.query.id as string)})

    res.status(200).json(result)
  } catch (e) {
    console.error(e);
    res.status(400)
  }
}
