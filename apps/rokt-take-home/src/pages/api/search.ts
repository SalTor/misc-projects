import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "pexels";
import type { PhotosWithTotalResults, ErrorResponse } from "pexels";

const client = createClient(process.env.PEXELS_API_KEY);

declare global {
  type SearchResponse = PhotosWithTotalResults | ErrorResponse;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  return client.photos
    .search({
      query: req.query.search as string,
      per_page: 10,
      page: req.query.page,
    })
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(400).json(err));
}
