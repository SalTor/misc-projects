import { NextApiRequest, NextApiResponse } from "next";

import { ObjectId } from "mongodb";

import clientPromise from "../../../../lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db("campaigns");

    const [campaign] = await db
      .collection("campaigns")
      .find({ _id: new ObjectId(req.query.id as string) })
      .toArray();
    const npcs = await db
      .collection("npcs")
      .find({
        campaign_id: campaign._id,
      })
      .limit(10)
      .toArray();

    // console.log({ npcs });
    res.json(npcs);
  } catch (e) {
    console.error(e);
  }
}
