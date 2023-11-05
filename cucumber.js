// eslint-disable-next-line no-undef
let common = [
  'features/**/*.feature', // Specify our feature files
  '--require-module ts-node/register', // Load TypeScript module
  '--require features/**/*.ts', // Load step definitions
  '--format progress-bar', // Load custom formatter
  '--format html:./output/reports/cucumber-report.html', // Load custom formatter
].join(' ');
module.exports = {
  default: common,
};
