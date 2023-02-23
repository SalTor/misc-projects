import { render } from "@testing-library/react";
import type { Photo } from "pexels";
import { QueryClient, QueryClientProvider } from "react-query";

import PhotoWall from "./PhotoWall";

const photos: Photo[] = [
  // example from https://www.pexels.com/api/documentation/#photos-overview
  {
    id: 2014422,
    width: 3024,
    height: 3024,
    url: "https://www.pexels.com/photo/brown-rocks-during-golden-hour-2014422/",
    photographer: "Joey Farina",
    photographer_url: "https://www.pexels.com/@joey",
    photographer_id: 680589,
    avg_color: "#978E82",
    src: {
      original:
        "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg",
      large2x:
        "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      large:
        "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      medium:
        "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=350",
      small:
        "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&h=130",
      portrait:
        "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
      landscape:
        "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      tiny: "https://images.pexels.com/photos/2014422/pexels-photo-2014422.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280",
    },
    liked: false,
    alt: "Brown Rocks During Golden Hour",
  },
];

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe("PhotoWall", () => {
  test("renders", () => {
    // a smoke test
    render(<PhotoWall photos={photos} />, { wrapper });
  });

  describe("different photo amounts", () => {
    test.todo("1 photo");
    test.todo("10 photos");
  });
});

test.todo("Page navigation");
