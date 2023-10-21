module.exports = {
  displayName: 'unit',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testMatch: ['**/src/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
