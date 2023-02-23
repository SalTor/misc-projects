import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "pexels";

const client = createClient(process.env.PEXELS_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  return client.photos
    .curated({ per_page: 10, page: req.query.page })
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(400).json(err));
}
