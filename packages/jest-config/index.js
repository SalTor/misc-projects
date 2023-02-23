/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(js|jsx|ts|tsx)$",
  rootDir: "./",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["../../packages/jest-config/setup.js"],
};
