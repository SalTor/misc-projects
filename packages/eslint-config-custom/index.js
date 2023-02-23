module.exports = {
  extends: ["next", "turbo", "prettier"],
  plugins: ["simple-import-sort"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          ["^next", "^react"],
          ["^@?\\w"],
          ["^src"],
          ["^src/styles"],
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
        ],
      },
    ],
  },
};
