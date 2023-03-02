import { NextApiRequest, NextApiResponse } from "next";

import { ObjectId } from "mongodb";

import clientPromise from "../../../lib/mongodb";

const index = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  if (!id) return res.redirect("/api/movies");
  try {
    const client = await clientPromise;
    const db = client.db("sample_mflix");

    const movies = await db
      .collection("movies")
      .find({ _id: new ObjectId(id as string) })
      .sort({ metacritic: -1 })
      .limit(10)
      .toArray();

    res.status(200).json(movies);
  } catch (e) {
    res.redirect("/api/movies");
  }
};

export default index;
