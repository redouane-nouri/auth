/**
 * @jest-environment jsdom
 */
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Path to load next.config.ts and .env files in our test environment
  dir: "./",
});

const config: Config = {
  // The test environment that will be used for testing
  testEnvironment: "jsdom",
  // More setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default createJestConfig(config);
