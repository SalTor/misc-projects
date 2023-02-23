import Image from "next/image";

import { useMemo } from "react";

import useRecommendations from "src/hooks/useRecommendations";
import { useCartStore } from "src/stores/cart";

const ShoppingCart: React.FC = () => {
  // const cart = useCartStore((state) => state.cart); // TODO: Why doesn't zustand computation work?
  const [
    isCartOpen,
    toggleCartOpen,
    addToCart,
    reduceFromCart,
    removeFromCart,
    currentCart,
  ] = useCartStore((state) => [
    state.isCartOpen,
    state.toggleCartOpen,
    state.addToCart,
    state.reduceFromCart,
    state.removeFromCart,
    state.currentCart,
  ]);

  const recommendations = useRecommendations();

  const cartSum = useMemo(() => {
    return Object.values(currentCart).reduce(
      (acc, curr) => (acc += curr.product.price * curr.count),
      0
    );
  }, [currentCart]);

  const {
    showShippingCopy,
    freeShippingProgressPercent,
    freeShippingProgressDollars,
  } = useMemo(() => {
    return {
      showShippingCopy: cartSum > 0,
      freeShippingProgressDollars: 150 - cartSum,
      freeShippingProgressPercent: `${(
        (1 - (150 - cartSum) / 150) *
        100
      ).toFixed(0)}%`,
    };
  }, [cartSum]);

  if (!isCartOpen) return null;

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[#d9d9d9]/80">
      <div
        className="absolute top-0 right-0 bottom-0 left-0 cursor-pointer"
        onClick={() => toggleCartOpen()}
        aria-label="Close cart"
      />

      <div className="absolute top-0 right-0 bottom-0 h-full bg-white p-[20px] pt-[60px] w-full sm:w-3/4 md:w-4/6 lg:w-3/6 xl:w-[600px] overflow-y-scroll max-w-[440px]">
        <button
          className="absolute top-6 left-6"
          onClick={() => toggleCartOpen()}
          aria-label="Close cart"
        >
          <Image
            src="/images/close-button.svg"
            height={28}
            width={28}
            alt="Close cart"
          />
        </button>

        <button
          className="absolute left-1/2 top-6 -translate-x-0.5"
          aria-hidden
        >
          <Image src="/images/cart.svg" height={40} width={37} alt="icon" />
        </button>

        <div className="mt-6">
          {showShippingCopy && (
            <div className="mb-8 text-center">
              {freeShippingProgressDollars < 0 ? (
                <p>Free shipping for you!</p>
              ) : (
                <div>
                  <p className="mb-3">
                    You&apos;re{" "}
                    <span className="font-medium">
                      ${freeShippingProgressDollars.toFixed(2)}
                    </span>{" "}
                    away from free shipping!
                  </p>
                  <div className="w-full bg-[#d7dad2] h-3">
                    <div
                      className="bg-[#155343] h-3"
                      style={{
                        width: freeShippingProgressPercent,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {Object.values(currentCart)
            .length /* TODO: figure out a computed value for this instead of running Object.values on every render */ ? (
            <>
              <div className="px-4">
                {Object.values(currentCart).map((c) => (
                  <article
                    key={c.product.id}
                    className="flex px-3 mb-3 place-content-between"
                  >
                    <div className="flex">
                      <div
                        className="relative"
                        style={{
                          height: 110,
                          width: 110,
                          minHeight: 110,
                          minWidth: 110,
                        }}
                      >
                        <Image
                          src={c.product.thumbnail.src}
                          fill
                          sizes="100%"
                          alt={c.product.thumbnail.alt || c.product.title}
                        />
                      </div>

                      <div className="mx-5 grid grid-cols-1 grid-rows-3 place-content-between">
                        <p className="text-sm">{c.product.title}</p>

                        <p className="text-sm">{`$${c.product.price}`}</p>

                        <div className="flex items-center">
                          <button
                            onClick={() => reduceFromCart(c.product)}
                            aria-label="Remove one from cart"
                          >
                            <Image
                              src="/images/circle-minus.svg"
                              height={20}
                              width={20}
                              alt="Remove one"
                            />
                          </button>

                          <div
                            className="mx-2 text-md leading-none"
                            aria-label="Current count in cart"
                          >
                            {c.count}
                          </div>

                          <button
                            onClick={() => addToCart(c.product)}
                            aria-label="Add another to cart"
                          >
                            <Image
                              src="/images/circle-plus.svg"
                              height={20}
                              width={20}
                              alt="Add another"
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      aria-label="Remove all from cart"
                      onClick={() => removeFromCart(c.product)}
                    >
                      <Image
                        src="/images/circle-trash.svg"
                        height={35}
                        width={35}
                        alt="Remove all"
                      />
                    </button>
                  </article>
                ))}

                <div className="my-6 flex justify-between text-lg">
                  <p className="font-medium">Subtotal</p>${cartSum.toFixed(2)}
                </div>
              </div>

              {!!recommendations.length && (
                <>
                  <div className="h-1 w-full bg-[#d7dad2] mx-1 mt-6 mb-2 rounded" />

                  <h1 className="mb-3 text-lg">Recommended Items</h1>

                  {recommendations.map((r) => (
                    <article
                      key={r.id}
                      className="flex justify-between items-center p-5 mb-3"
                    >
                      <div
                        className="relative"
                        style={{
                          height: 110,
                          width: 110,
                          minHeight: 110,
                          minWidth: 110,
                        }}
                      >
                        <Image
                          src={r.thumbnail.src}
                          fill
                          sizes="100%"
                          alt={r.thumbnail.alt || r.title}
                        />
                      </div>

                      <span>
                        <h1 className="text-lg font-medium grow-1 w-[170px]">
                          {r.title}
                        </h1>
                      </span>

                      <button onClick={() => addToCart(r)}>
                        <Image
                          src="/images/circle-plus.svg"
                          height={35}
                          width={35}
                          alt="Add to cart"
                          style={{ minWidth: 35, minHeight: 35 }}
                        />
                      </button>
                    </article>
                  ))}
                </>
              )}
            </>
          ) : (
            <h1>Empty shopping cart</h1>
          )}
        </div>
      </div>
    </div>
  );
};
export default ShoppingCart;
