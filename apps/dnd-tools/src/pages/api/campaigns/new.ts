import { NextApiRequest, NextApiResponse } from "next";

import clientPromise from "../../../lib/mongodb";

const index = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST")
    return res.status(400).json({ error: "Not allowed" });

  try {
    const client = await clientPromise;
    const db = client.db("campaigns");
    const result = await db
      .collection("campaigns")
      .insertOne(JSON.parse(req.body));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500);
  }
};

export default index;
