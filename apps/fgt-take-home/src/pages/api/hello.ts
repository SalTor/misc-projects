// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import catalog from "./FGT-Frontend-Take-Home.json";

declare global {
  type Catalog = {
    products: Product[];
    recommendations: Product[];
  };

  type Product = {
    title: string;
    body: string;
    id: number;
    images: ProductImage[];
    price: number;
    product_type: string;
    tags: string;
    thumbnail: ProductImage;
  };
}

type ProductImage = {
  alt?: string;
  created_at: string;
  height: number;
  id: number;
  product_id: number;
  src: string;
  updated_at: string;
  variant_ids?: string[];
  width: number;
};

type Data = {
  name: string;
  catalog: Catalog;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: "John Doe", catalog });
}
