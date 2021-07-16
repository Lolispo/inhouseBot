module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ["<rootDir>/tests/mocks/", "<rootDir>/tests/migration.test.ts"],
};