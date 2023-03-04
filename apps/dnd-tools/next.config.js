// @ts-check
const { env } = require('./src/server/env');
module.exports = {
    /**
   * Dynamic configuration available for the browser and server.
   * Note: requires `ssr: true` or a `getInitialProps` in `_app.tsx`
   * @link https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
   */
  publicRuntimeConfig: {
    NODE_ENV: env.NODE_ENV,
  },
  reactStrictMode: true,
  transpilePackages: ["ui"],
};
