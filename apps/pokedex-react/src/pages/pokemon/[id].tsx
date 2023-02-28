import { GetStaticPropsContext, InferGetServerSidePropsType } from "next";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import { Pokemon } from "pokenode-ts";

function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

function zeroPad(num: number, places: number = 3) {
  return `${"0".repeat(places)}${num}`.slice(-places);
}

function formatStatName(name: string): string {
  return (
    {
      hp: "HP",
      "special-attack": "Sp. Atk",
      "special-defense": "Sp. Def",
    }[name.toLowerCase()] || capitalize(name)
  );
}

const bgColors: Record<string, string> = {
  fire: "#ff5e63",
  grass: "#30caa8",
  electric: "#ffd06c",
  poison: "#9980B3",
  bug: "#9980B3",
};

export default function PokemonPage(
  props: InferGetServerSidePropsType<typeof getStaticProps>
) {
  const { pokemon } = props;
  if (!pokemon) return null;
  const type = pokemon.types[0].type.name;

  return (
    <div className="" style={{ backgroundColor: bgColors[type] }}>
      <header className="text-white p-3 h-[200px]">
        <div className="flex justify-between items-center font-medium">
          <div>
            <h1 className="text-2xl">{capitalize(pokemon.name)}</h1>
            <div className="flex mt-3 relative">
              {pokemon.types.map((type) => (
                <div
                  key={type.type.name}
                  className="rounded-full px-6 py-1 bg-red-500 text-white mr-1 text-xs bg-white/40 font-bold z-10"
                >
                  {capitalize(type.type.name)}
                </div>
              ))}
            </div>
          </div>
          <p className="font-mono">#{zeroPad(pokemon.id)}</p>
        </div>
      </header>

      <article className="px-5 pt-6 bg-white relative rounded-t-2xl">
        {pokemon.sprites.front_default && (
          <img
            src={pokemon.sprites.front_default}
            className="absolute -top-[210px] left-1/2 -translate-x-1/2 md:left-1/4 md:translate-x-0 h-[300px] pointer-events-none z-0"
          />
        )}

        <Tabs selectedTabClassName="border-[#37A5C6] focus:outline-none text-[#000000]">
          {/* TODO: Update border to sliding overlay whose position is calculated */}
          <TabList className="flex mb-4 hover:cursor-pointer">
            <Tab className="pr-4 py-4 border-b text-[#aab3c7] font-medium">
              About
            </Tab>
            <Tab className="px-4 py-4 border-b text-[#aab3c7] font-medium">
              Base Stats
            </Tab>
            <Tab className="px-4 py-4 border-b text-[#aab3c7] font-medium">
              Evolution
            </Tab>
            <Tab className="px-4 py-4 border-b text-[#aab3c7] font-medium">
              Moves
            </Tab>
          </TabList>

          <TabPanel>
            <div className="grid grid-cols-[100px_auto] gap-y-3">
              <div className="text-slate-500">Height</div>
              <div>
                {pokemon.height} (TODO: annotate ft. in. + include cm
                conversion)
              </div>

              <div className="text-slate-500">Weight</div>
              <div>{pokemon.weight} lbs (TODO: include kg conversion)</div>

              <div className="text-slate-500">Abilities</div>
              <div>
                {pokemon.abilities
                  .map((a) => capitalize(a.ability.name))
                  .join(", ")}
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            {pokemon.stats.map((s) => (
              <div
                key={s.stat.name}
                className="grid grid-cols-[100px_auto] mb-3"
              >
                <div className="text-slate-500">
                  {formatStatName(s.stat.name)}
                </div>
                <div>
                  <div className="font-medium">{s.base_stat}</div>
                  <div>{/* TODO: implement bar graph */}</div>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[100px_auto] mb-3">
              <div className="text-slate-500">Total</div>
              <div>
                <div className="font-medium">
                  {pokemon.stats.reduce((acc, curr) => acc + curr.base_stat, 0)}
                </div>
                <div>{/* TODO: implement bar graph */}</div>
              </div>
            </div>
          </TabPanel>
          <TabPanel>info for "evolution"</TabPanel>
          <TabPanel>info for "moves"</TabPanel>
        </Tabs>
      </article>
    </div>
  );
}

export function getStaticPaths() {
  return {
    paths: [{ params: { id: "1" } }],
    fallback: true,
  };
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const res = await fetch(
    "http://localhost:3000/api/pokemon?name=" +
      encodeURIComponent(context.params?.id as string)
  ).then((r) => r.json());
  return {
    props: {
      pokemon: res as Pokemon,
    },
  };
}
