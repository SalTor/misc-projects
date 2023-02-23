import React from "react";
import { render, screen } from "@testing-library/react";

import ShoppingCart from "./shopping-cart";

test("should show shopping cart", () => {
  render(<ShoppingCart />);
});

describe("shopping cart reflects zustand store", () => {
  test.todo("adding item");
  test.todo("remove item");
  describe("recommendations", () => {
    test.todo("shows when appropriate");
  });
});
