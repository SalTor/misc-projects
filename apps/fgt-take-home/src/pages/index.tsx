import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import catalog from "src/pages/api/FGT-Frontend-Take-Home";

export default function Home(props: Catalog) {
  return (
    <>
      <Head>
        <title>Fast Growing Trees</title>
      </Head>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-7">
        {props.products.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id}>
            <article
              className="rounded-md truncate bg-white border border-solid border-[#c4c4c4]"
              style={{ boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.1)" }}
            >
              <Image
                src={product.thumbnail.src}
                width={281}
                height={253}
                alt={product.thumbnail.alt || product.title}
              />

              <div className="flex justify-center items-center text-center px-2 w-full sm:p-0 sm:w-8/12 whitespace-normal m-auto h-[76px]">
                <span>{product.title}</span>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </>
  );
}

export async function getServerSideProps() {
  return {
    props: catalog,
  };
}
