module.exports = {
  displayName: 'integration',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '__tests__/integration',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
