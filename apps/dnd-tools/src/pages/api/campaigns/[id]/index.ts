import { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") return res.status(404);
  const prisma = new PrismaClient();
  await prisma.$connect();

  try {
    const campaignId = req.query.id as string;
    const whereCampaign = { where: { campaignId } };
    await prisma.npc.deleteMany(whereCampaign);
    await prisma.player.deleteMany(whereCampaign);
    await prisma.battle.deleteMany(whereCampaign);
    await prisma.campaign.delete({ where: { id: campaignId } });
    res.status(200).json();
  } catch (error) {
    res.status(500).send(error);
  }
}
