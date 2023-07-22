/* eslint @typescript-eslint/no-var-requires: 0 */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    modulePaths: ['<rootDir>'],
    transform: {
        '^.+\\.[ts|d.ts]$': 'ts-jest',
    },
    // setupFiles: ['<rootDir>/test/helpers/setup.js'],
    // globalSetup: '<rootDir>/test/helpers/setup.js',
    // globalTeardown: '<rootDir>/test/helpers/teardown.js',
};

module.exports = config;
