/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],

  moduleFileExtensions: ["ts", "js", "json"],

  // Crucial: Tell ts-jest to use the CommonJS override
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },

  // Fix ESM dependencies like supertest/express
  transformIgnorePatterns: ["/node_modules/(?!(supertest|express)/)"],

  // Optional but helps Jest treat .ts as modules
  extensionsToTreatAsEsm: [],

  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  clearMocks: true,
  restoreMocks: true,
  testTimeout: 30000,

  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
