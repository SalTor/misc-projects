import { NextApiRequest, NextApiResponse } from "next";

import { Endpoints, RequestError } from "@octokit/types";
import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]
  >
) {
  const {
    user: owner,
    repo,
    page = "1",
  } = req.query as {
    user: string;
    repo: string;
    page: string;
  };
  try {
    const results = await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner,
      repo,
      page: parseInt(page, 10),
    });
    return res.status(200).json(results);
  } catch (error) {
    if ((error as RequestError).status === 404) {
      return res.status(404);
    }
    return res.status(500);
  }
}
