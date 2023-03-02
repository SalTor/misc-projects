import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation } from "react-query";

export default function NewCampaignPage() {
  const [title, setTitle] = useState("");
  const router = useRouter();

  const { mutate: createPost } = useMutation({
    mutationFn: async (title: string) =>
      await fetch("/api/campaigns/new", {
        method: "POST",
        body: JSON.stringify({ title }),
      }).then((res) => res.json()),
  });

  const submit = () => {
    createPost(title, {
      onSettled(data, error, variables) {
        console.log("settled createPost", { data, error, variables });
        if (error) return;
        router.push("/campaigns/" + data.insertedId);
      },
    });
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">Create a new campaign!</h1>
      <label htmlFor="title">
        <span>Campaign title</span>
        <input
          className="border border-black"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <button
        onClick={() => submit()}
        className="ml-5 border border-black px-3 rounded"
      >
        Submit
      </button>
    </div>
  );
}
