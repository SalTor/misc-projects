import { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "@prisma/client";

const index = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST")
    return res.status(400).json({ error: "Not allowed" });

  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    const body = JSON.parse(req.body);
    const campaign = await prisma.campaign.create({
      data: body,
    });

    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).send(error);
  }
};

export default index;
