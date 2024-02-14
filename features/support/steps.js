const pactum = require('pactum');
const { Given, When, Then, After, Before } = require('@cucumber/cucumber');

let spec = pactum.spec();

const apiBaseUrl = 'http://localhost:6006';

Before(() => {
  spec = pactum.spec();
});

Given(/^I make a "(.*)" request to "(.*)"$/, async function (method, endpoint) {
  this.method = method.toLowerCase();
  this.url = `${apiBaseUrl}${endpoint}`;
});

When(/I receive a response/, async function () {
  await spec[this.method](this.url);
});

Then('I expect response should have a status {int}', function (statusCode) {
  spec.response().should.have.status(statusCode);
});

After(() => {
  spec.end();
});
