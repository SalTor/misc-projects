import { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();
  await prisma.$connect();

  const npc_id = req.query.npc_id as string;

  try {
    if (req.method === "PUT") {
      const body = JSON.parse(req.body);
      const { id: _, ...withoutId } = body;
      const npc = await prisma.npc.update({
        where: {
          id: npc_id,
        },
        data: withoutId,
      });
      res.status(200).json(npc);
    } else if (req.method === "DELETE") {
      await prisma.npc.delete({ where: { id: npc_id } });
      res.status(200).json({});
    } else {
      res.status(400).json({ message: "Perform GET against a campaign" });
    }
  } catch (error) {
    res.status(500);
  }
}
