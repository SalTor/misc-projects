import { create } from "zustand";
import { createJSONStorage } from "zustand/middleware";

type CartItem = { count: number; product: Product };

export const useCartStore = create<{
  isCartOpen: boolean;
  toggleCartOpen(): void;
  cart: () => CartItem[];
  currentCart: Record<number, CartItem>;
  addToCart(product: Product): void;
  reduceFromCart(product: Product): void;
  removeFromCart(product: Product): void;
}>((set, get) => ({
  isCartOpen: false,
  toggleCartOpen: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  currentCart: {},
  cart: () => Object.values(get().currentCart),
  addToCart: (product) =>
    set((state) => {
      const existing = state.currentCart[product.id];
      if (existing) {
        return {
          currentCart: {
            ...state.currentCart,
            [product.id]: {
              ...existing,
              count: existing.count + 1,
            },
          },
        };
      }
      state.currentCart[product.id] = { count: 1, product };
      return {
        currentCart: { ...state.currentCart },
      };
    }),
  reduceFromCart: (product) =>
    set((state) => {
      const existing = state.currentCart[product.id];
      if (!existing) return { currentCart: state.currentCart };
      if (existing.count === 1) {
        delete state.currentCart[product.id];
        return {
          currentCart: { ...state.currentCart },
        };
      }
      state.currentCart[product.id].count--;
      return {
        currentCart: { ...state.currentCart },
      };
    }),
  removeFromCart: (product) =>
    set((state) => {
      const copy = { ...state.currentCart };
      delete copy[product.id];
      return {
        currentCart: { ...copy },
      };
    }),
}));
