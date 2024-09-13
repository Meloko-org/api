/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  verbose: true,
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
};

module.exports = config;
