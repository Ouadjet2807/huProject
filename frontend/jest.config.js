/** @type {import('jest').Config} */
const config = {
  verbose: true,
  transformIgnorePatterns: ["node_modules/(?!uuid)"],
  moduleNameMapper: {
    uuid: require.resolve("uuid"),
  },
};

module.exports = config;
