import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("saltor");
  const [reponame, setReponame] = useState("dotfiles");
  // TODO: Refactor so you enter a valid username and then fetch a list of public repos and then you choose from that
  const router = useRouter();

  return (
    <div className="pt-5 flex content-center items-center h-screen">
      <Head>
        <title>Homepage</title>
      </Head>

      <div className="max-w-[300px] mx-auto">
        <section className="flex flex-col gap-1">
          <input
            className="border border-black p-3 pl-2 rounded border focus:border-[#3f8a8c]"
            onChange={(event) => setUsername(event.target.value)}
            name="username"
            type="text"
            value={username}
          />

          <input
            className="border border-black p-3 pl-2 rounded border focus:border-[#3f8a8c]"
            onChange={(event) => setReponame(event.target.value)}
            name="reponame"
            type="text"
            value={reponame}
          />

          <button
            type="button"
            className="disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 px-3 py-2 bg-[#00676c] text-white rounded self-end"
            onClick={() => {
              /* history.push(`/${username}/${reponame}`) */
              const route = `/${username}/${reponame}`;
              router.push(route);
            }}
            disabled={!username || !reponame}
          >
            Submit
          </button>
        </section>
      </div>
    </div>
  );
}
