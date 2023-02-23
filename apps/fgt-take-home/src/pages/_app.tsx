import type { AppProps } from "next/app";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { useMemo } from "react";

import ShoppingCart from "src/components/shopping-cart";
import useRecommendations from "src/hooks/useRecommendations";
import { useCartStore } from "src/stores/cart";

import "src/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [toggleCartOpen, currentCart] = useCartStore((state) => [
    state.toggleCartOpen,
    state.currentCart,
  ]);
  const productBadge = useMemo(() => {
    const productId = router.query.id;
    if (productId) {
      return currentCart[parseInt(productId as string, 10)]?.count || null;
    }
    return null;
  }, [currentCart, router.query]);

  return (
    <>
      <main className="m-auto max-w-[1024px] px-[60px]">
        <nav
          className={`flex justify-between mb-${
            router.pathname === "/" ? "5" : "8"
          } w-full`}
        >
          <Link href="/" aria-label="Go home">
            <Image src="/images/logo.svg" height={38} width={30} alt="Logo" />
          </Link>

          <button
            onClick={toggleCartOpen}
            className="relative"
            aria-label="View cart"
          >
            <Image
              src="/images/circle-cart.svg"
              height={50}
              width={50}
              alt="Cart"
            />
            {productBadge && (
              <span
                className="absolute -top-1 -right-1 h-4 w-4 flex justify-center items-center text-white text-center bg-[red] rounded-full"
                style={{ fontSize: 8 }}
              >
                <span>{productBadge}</span>
              </span>
            )}
          </button>
        </nav>

        <Component {...pageProps} />

        <ShoppingCart />
      </main>
    </>
  );
}
