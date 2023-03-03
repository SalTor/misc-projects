import { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(400).json({ message: "Only POST accepted" });

  try {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const body = JSON.parse(req.body);
    const npc = await prisma.npc.create({
      data: {
        campaignId: req.query.id as string,
        ...body,
      },
    });

    res.status(200).json(npc);
  } catch (error) {
    res.status(400).send(error);
  }
}
