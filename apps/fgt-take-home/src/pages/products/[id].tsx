import type { GetStaticPropsContext } from "next";
import Head from "next/head";
import Image from "next/image";

import catalog from "src/pages/api/FGT-Frontend-Take-Home";
import { useCartStore } from "src/stores/cart";

export default function Product(props: { details: Product | null }) {
  const { details: data, fallback } = props;
  const [addToCart, toggleShowCart] = useCartStore((state) => [
    state.addToCart,
    state.toggleCartOpen,
  ]);

  if (!data) return <p>Loading ...</p>;

  const img = data.images[0] || data.thumbnail;

  return (
    <>
      <Head>
        <title>Products/{data.title}</title>
      </Head>

      <div className="flex flex-col md:flex-row md:gap-5 items-start">
        <h1 className="md:hidden text-3xl mx-auto text-center mb-5 underline">
          {data.title}
        </h1>

        <div className="relative w-[300px] md:w-3/5 h-[300px] md:h-[500px] rounded-md truncate mx-auto mb-5 mt-0 md:m-0">
          <Image
            src={img.src}
            height={img.height}
            width={img.width}
            alt={img.alt || data.title}
          />
        </div>

        <aside className="md:w-2/5 bg-white truncate rounded-md whitespace-normal p-4">
          <h1 className="text-3xl hidden md:flex">{data.title}</h1>

          <p className="my-4 font-medium hidden md:flex">About</p>

          <p>{data.body}</p>

          <button
            className="mt-6 w-full p-4 py-2.5 text-center text-2xl bg-[#CD0100] text-white rounded-md"
            onClick={() => {
              addToCart(data);
              toggleShowCart();
              window.scrollTo(0, 0);
            }}
          >
            Add to Cart
          </button>
        </aside>
      </div>
    </>
  );
}

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  if (context.params?.id) {
    const match = catalog.products.find(
      (p) => p.id === parseInt(context.params.id, 10)
    );
    if (match) return { props: { details: match } };
    return { props: { details: null } };
  }
  return { props: { details: null } };
}

export function getStaticPaths() {
  return {
    paths: [{ params: { id: "1" } }],
    fallback: true,
  };
}
