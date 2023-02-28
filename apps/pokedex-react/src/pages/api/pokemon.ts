import { NextApiRequest, NextApiResponse } from "next";

import { MainClient } from "pokenode-ts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name } = req.query;
  if (!name)
    return res.status(500).json({
      error: "No name",
      message: "Please provide a name for which pokemon you wish to pull up",
    });
  const parsed = parseInt(name as string, 10);
  if (typeof parsed === "number" && !Number.isNaN(parsed)) {
    const api = new MainClient();
    await api.pokemon
      .getPokemonById(parsed)
      .then((data) => res.status(200).json(data))
      .catch((error) => res.status(500).json({ error }));
  } else {
    const api = new MainClient();
    await api.pokemon
      .getPokemonByName(name as string)
      .then((data) => res.status(200).json(data))
      .catch((error) => res.status(500).json({ error }));
  }
}
