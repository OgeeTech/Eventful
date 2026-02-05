import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/**/*.test.ts'], // Look for .test.ts files
    verbose: true,
    forceExit: true, // Force close open connections (Redis/Mongo) after tests
    clearMocks: true,
};

export default config;