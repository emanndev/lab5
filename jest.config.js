module.exports = {
    testEnvironment: 'jsdom', // Simulates a browser-like environment
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional setup file
    moduleNameMapper: {
      '\\.(css|scss)$': 'identity-obj-proxy', // Mocks CSS imports
    },
    testPathIgnorePatterns: ['/node_modules/'],
  };