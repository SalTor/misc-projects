import { InferGetServerSidePropsType } from "next";

import clientPromise from "../../lib/mongodb";

export default function Top({
  movies,
}: InferGetServerSidePropsType<typeof getStaticProps>) {
  return (
    <div className="p-5">
      <h1>Top 1000 Movies of All Time</h1>
      <p>
        <small>(According to Metacritic)</small>
      </p>
      <div className="grid grid-cols-3 gap-3">
        {movies.map((movie) => (
          <article key={movie._id} className="p-6 border border-black rounded">
            <div className="flex justify-between font-bold mb-2">
              <h2 className="">{movie.title}</h2>
              <h3>Rating: {movie.metacritic}</h3>
            </div>
            <p>{movie.plot}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const client = await clientPromise;
    const db = client.db("sample_mflix");

    const movies = await db
      .collection("movies")
      .find({})
      .sort({ metacritic: -1 })
      .limit(1000)
      .toArray();

    return {
      props: { movies: JSON.parse(JSON.stringify(movies)) as Movies },
    };
  } catch (e) {
    console.error(e);
  }
}
