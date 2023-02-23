const common = require("../../packages/jest-config");

const tsconfig = require("./tsconfig.json");
const moduleNameMapper = require("tsconfig-paths-jest")(tsconfig);

module.exports = {
  ...common,
  moduleNameMapper,
};
