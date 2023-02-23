import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { Endpoints, RequestError } from "@octokit/types";
import { format, parseISO } from "date-fns";

export default function UsernameReponame(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  const { user, repo } = router.query;
  const url = `/${user}/${repo}`;

  const [commits, setCommits] = useState(props.results.data || []);
  const [page, setPage] = useState(1);

  return (
    <div>
      <Head>
        <title>Repo {url}</title>
      </Head>
      <section className="p-5 flex flex-col justify-center">
        {props.missingAPIKey && (
          <section id="alert" className="flex justify-center m-5">
            <article className="bg-red-600 text-white font-bold rounded-md px-8 py-3">
              MISSING API KEY. YOU MIGHT GET RATE LIMITED. SEE README
            </article>
          </section>
        )}

        <h1 className="text-center text-2xl mb-5 text-white">
          Showing results for:{" "}
          <Link href={`https://github.com${url}`} target="_blank">
            {url}
          </Link>
        </h1>

        <section className="flex justify-center">
          <table className="text-sm text-left">
            <tbody>
              {commits.map((commit) => (
                <tr className="bg-white border-b align-top" key={commit.sha}>
                  <th className="px-6 py-3">
                    {commit.commit.author?.date &&
                      format(
                        parseISO(commit.commit.author.date),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                  </th>
                  <td className="px-6 py-3 text-[#669398] max-w-[400px]">
                    <Link href={commit.commit.url} target="_blank">
                      {commit.commit.message}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    {commit.commit.author?.name || commit.commit.author?.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {!!props.results?.headers?.link && (
          <button
            className="bg-[#21585e] text-white mx-auto mt-5 px-5 py-2"
            onClick={() => {
              const nextPage = page + 1;
              fetch(
                `http://localhost:3000/api/commits?user=${user}&repo=${repo}&page=${nextPage}`
              )
                .then((r) => r.json())
                .then((res) => {
                  setPage(nextPage);
                  setCommits((c) => [...c, ...res.data]);
                });
            }}
          >
            Load More
          </button>
        )}
      </section>
    </div>
  );
}

const missingAPIKey = !process.env.GITHUB_API_KEY;
type Props = {
  results: Endpoints["GET /repos/{owner}/{repo}/commits"]["response"];
  missingAPIKey: boolean;
  extra?: Record<string, any>;
};
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const { user, repo } = context.params as { user: string; repo: string };
  const page = 1;
  try {
    const res = await fetch(
      `http://localhost:3000/api/commits?user=${user}&repo=${repo}&page=${page}`
    ).then((r) => r.json());
    return {
      props: {
        results: res,
        missingAPIKey,
      },
    };
  } catch (error) {
    if ((error as RequestError).status === 404) {
      return {
        redirect: {
          destination: "/does/not/exist",
        },
      };
    }
    return {
      props: {
        results: [],
        missingAPIKey,
      },
    };
  }
};
