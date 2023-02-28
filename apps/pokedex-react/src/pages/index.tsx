import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";

import type { Pokemon } from "pokenode-ts";

export default function Web() {
  const [pokemon, setPokemon] = useState<Pokemon>();
  const { mutate } = useMutation(async (name: string) => {
    return await fetch(
      "http://localhost:3000/api/pokemon?name=" + encodeURIComponent(name)
    ).then((res) => res.json());
  });
  useEffect(() => {
    mutate("pikachu", {
      onSuccess(data) {
        setPokemon(data);
      },
    });
    return () => {};
  }, []);
  useEffect(() => {
    if (!pokemon) return;
    console.log("pokemon", pokemon);
  }, [pokemon]);
  return (
    <div>
      <h1>Pokedex</h1>
      {pokemon && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Front</th>
              <th>Types</th>
              <th>Height</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Link href={"/pokemon/" + pokemon.id}>{pokemon.name}</Link>
              </td>
              <td>
                <img src={pokemon.sprites.front_default} />
              </td>
              <td>{pokemon.types.map((type) => type.type.name).join(", ")}</td>
              <td>{pokemon.height} ft.</td>
              <td>{pokemon.weight} lb.</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
