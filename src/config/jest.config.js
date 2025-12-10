/** @type {import('jest').Config} */
const config = {
  // use ts-jest for TypeScript support
  preset: "ts-jest",

  // Test environment
  testEnvironment: "node",

  // Root directories for tests
  roots: ["<rootDir>/tests"],

  // Test file patterns
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Transform Typescript files using ts-jest
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: false,
        isolatedModules: true,
        tsconfig: {
          target: "ES2020",
          module: "CommonJS",
          moduleResolution: "Node",
          esModuleInterop: true,
          strict: true,
          skipLibCheck: true,
          resolveJsonModule: true,
        },
      },
    ],
  },

  // Setup files to run before each test suite
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
    "!src/config/index.ts",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Coverage output directory
  coverageDirectory: "coverage",

  // Verbose output
  verbose: true,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Test timeout (30 seconds for integration tests)
  testTimeout: 30000,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,
};

module.exports = config;
