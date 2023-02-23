/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(js|jsx|ts|tsx)$",
  rootDir: "./",
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
};
