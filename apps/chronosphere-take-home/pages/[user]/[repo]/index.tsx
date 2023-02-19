import { useState } from "react";
import { useRouter } from "next/router";
import { Octokit } from "octokit";
import Link from "next/link";
import { parseISO, format } from "date-fns";

export default function UsernameReponame(props) {
  const [commits, setCommits] = useState(props.results.data);
  const router = useRouter();
  const url = `/${router.query.user}/${router.query.repo}`;
  return (
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
                  {format(
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
                  {commit.commit.author.name || commit.commit.author.email}
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
            const next = props.results.headers.link
              .split(",")
              .map((str) => str.match(/<(.+)>/i)[1])[0];
            console.log("next", next);
          }}
        >
          Load More
        </button>
      )}
    </section>
  );
}

export async function getServerSideProps(context) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_API_KEY,
  });

  const { user: owner, repo } = context.params;
  try {
    const results = await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner,
      repo,
    });
    // const test = await octokit.request(
    //   "GET /repositories/133512541/commits?page=2"
    // );
    return {
      props: {
        results,
        missingAPIKey: !process.env.GITHUB_API_KEY,
      },
    };
  } catch (error) {
    if (error.status === 404) {
      return {
        redirect: {
          destination: "/does/not/exist",
        },
      };
    }
    return {
      props: {
        results: [],
        missingAPIKey: !process.env.GITHUB_API_KEY,
      },
    };
  }
}
