import { QueryClient, QueryClientProvider } from "react-query";

import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
