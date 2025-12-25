module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/packages/lib/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', 'packages'],
  moduleNameMapper: {
    '^@repo/(.*)$': '<rootDir>/packages/$1/src',
    '^@repo/lib/(.*)$': '<rootDir>/packages/lib/src/$1',
    '^@repo/store/(.*)$': '<rootDir>/packages/store/src/$1',
    '^@repo/config/(.*)$': '<rootDir>/packages/config/src/$1',
    '^@repo/ui/(.*)$': '<rootDir>/packages/ui/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};