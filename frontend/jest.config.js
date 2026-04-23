/** @returns {Promise<import('jest').Config>} */
module.exports = async () => {
  return {
    verbose: true,
    testEnvironment: 'jest-fixed-jsdom',
    moduleDirectories: ['node_modules', '<rootDir>'],
  };
};