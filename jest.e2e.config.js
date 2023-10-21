module.exports = {
  displayName: 'e2e',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '__tests__/e2e',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
