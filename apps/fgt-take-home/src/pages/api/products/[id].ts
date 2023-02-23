import type { NextApiRequest, NextApiResponse } from "next";

import catalog from "../FGT-Frontend-Take-Home";
export default function productsHandler(
  req: NextApiRequest,
  res: NextApiResponse<Product>
) {
  console.log("PRODUCTS HANDLER");
  const { query, method } = req;
  const id = parseInt(query.id as string, 10);
  const name = query.name as string;

  switch (method) {
    case "GET":
      const match = catalog.products.find((p) => p.id === id);
      if (match) {
        console.log("match", match);
        res.status(200).json(match);
      } else {
        res.status(404);
      }
      break;

    default:
      console.log("default request");
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
