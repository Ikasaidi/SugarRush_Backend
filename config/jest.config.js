module.exports = {
  rootDir: "..",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/tests/**/*.test.ts",
    "<rootDir>/tests/**/*.spec.ts",
    "<rootDir>/src/**/*.test.ts",
    "<rootDir>/src/**/*.spec.ts",
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "html"],

  coveragePathIgnorePatterns: [
  "/node_modules/",
  "/dist/",
  "/src/scripts/",
  "/src/pollers/",
  "/src/data/",
  "/src/config/",
  "/src/server.ts",
]
};