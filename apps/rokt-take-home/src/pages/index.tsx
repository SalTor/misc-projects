import { useState, useEffect } from "react";

import { useMutation } from "react-query";
import type {PhotosWithTotalResults, Photo} from 'pexels'

import PhotoWall from "../components/PhotoWall";

const placeholder = new Array(10).fill("");

export default function Home() {
  const [page, setPage] = useState(0);

  const [curated, setCurated] = useState<Record<string, Photo[]>>({});
  const { mutate: getCuratedPage, isFetching: isFetchingCurated } = useMutation(
    ([page, search]: [page: number, search?: string]) =>
      fetch("/api/curated?page=" + page).then((res) => res.json())
  );

  const [shouldShowSearch, setShouldShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [searches, setSearches] = useState({});
  const { mutate: getSearchResults, isFetching: isFetchingSearch } =
    useMutation(([page, search]: [page: number, search?: string]) => {
      return fetch(
        `/api/search?search=${encodeURIComponent(search || '')}&page=${page}`
      ).then((res) => res.json());
    });

  const fetchNextPage = () => {
    // TODO: Can we further abstract out the rendering and this navigation so we can remove these ternary checks?
    const mutation = shouldShowSearch ? getSearchResults : getCuratedPage;
    const source = shouldShowSearch ? searches : curated;
    const setter = shouldShowSearch ? setSearches : setCurated;

    const nextPage = page + 1;
    if (source[nextPage]) {
      return setPage(nextPage);
    }

    mutation([nextPage, search], {
      onSettled(data: PhotosWithTotalResults) {
        if (data) {
          setter((c) => {
            c[nextPage] = data.photos;
            return c;
          });
          setPage(nextPage);
        }
      },
    });
  };
  const fetchPreviousPage = () => {
    const mutation = shouldShowSearch ? getSearchResults : getCuratedPage;
    const source = shouldShowSearch ? searches : curated;
    const setter = shouldShowSearch ? setSearches : setCurated;

    const prevPage = page - 1;
    if (source[prevPage]) {
      return setPage(prevPage);
    }

    mutation([prevPage, search], {
      onSettled(data: PhotosWithTotalResults) {
        setter((c) => {
          c[prevPage] = data.photos;
          return c;
        });
        setPage(prevPage);
      },
    });
  };
  const disabledClass =
    "disabled:cursor-not-allowed disabled:text-slate-300 disabled:bg-slate-100";
  const isFetching = isFetchingCurated || isFetchingSearch;
  const isPrevDisabled = isFetching || page === 1;
  const isNextDisabled = isFetching;

  useEffect(() => {
    if (shouldShowSearch) {
      // the toggling of this boolean field tells us when page is set and we should start fetching for search-related photos
      fetchNextPage();
    }
  }, [shouldShowSearch]);

  useEffect(() => {
    // When we first load the app, fetch the photos
    fetchNextPage();
    return () => {};
  }, []);

  return (
    <div className="pt-3">
      {!shouldShowSearch && (
        <section className="flex justify-center items-center">
          <label htmlFor="search" className="relative">
            <span>Search</span>
            <input
              className="border border-black pl-1 m-1"
              name="Search"
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              id="search"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setSearches({});
              setPage(0);
              setShouldShowSearch(true);
            }}
            className={`border-black px-4 py-2 bg-blue-400 text-white rounded-md ${
              shouldShowSearch ? disabledClass : ""
            }`}
            disabled={shouldShowSearch}
          >
            SUBMIT
          </button>
        </section>
      )}

      {shouldShowSearch && (
        <section className="flex justify-center items-center">
          <span>Searching for: {search}</span>
          <button
            onClick={() => {
              setSearch("");
              setSearches({});
              setShouldShowSearch(false);
              setPage(1);
            }}
            className="rounded-md px-4 py-1 text-sm ml-5 bg-gray-300"
            aria-label="Clear search"
          >
            clear
          </button>
        </section>
      )}

      <nav className="grid grid-cols-2 gap-5 max-w-[500px] mx-auto my-5">
        <button
          className={`border px-6 py-3 rounded-md bg-green-100 ${
            isPrevDisabled ? disabledClass : ""
          }`}
          type="button"
          onClick={() => {
            fetchPreviousPage();
            setPage(page - 1);
          }}
          disabled={isPrevDisabled}
        >
          prev page
        </button>

        <button
          type="button"
          className={`border px-6 py-3 rounded-md bg-green-100 ${
            isNextDisabled ? disabledClass : ""
          }`}
          onClick={() => {
            fetchNextPage();
            setPage(page + 1);
          }}
          disabled={isNextDisabled}
        >
          next page
        </button>
      </nav>

      {shouldShowSearch ? (
        /* our placeholder variable gives us a blank grey box until our images render */
        <PhotoWall photos={searches[page] || placeholder} />
      ) : (
        <PhotoWall photos={curated[page] || placeholder} />
      )}
    </div>
  );
}
