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
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
};