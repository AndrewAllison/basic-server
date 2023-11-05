import {
  afterAll,
  beforeAll,
  binding,
  given,
  then,
  when,
} from 'cucumber-tsflow';
import { spec } from 'pactum';

const apiBaseUrl = process.env.API_TEST_URL || 'http://localhost:6006';

@binding()
class AppRootSteps {
  method: string;
  url: string;
  spec: any;

  constructor() {
    this.spec = spec();
  }

  @beforeAll()
  public static beforeAllScenarios() {
    console.log('Before All');
  }

  @afterAll()
  public static afterAllScenarios() {
    // pactum.end();
  }

  @given(/^I make a "(.*)" request to "(.*)"$/)
  public makeARequest(method: string, endpoint: string): void {
    this.method = method.toLowerCase();
    this.url = `${apiBaseUrl}${endpoint}`;
  }

  @when(/I receive a response/)
  public async receivesAResponse() {
    await this.spec[this.method](this.url);
  }
  @then('I expect response should have a status {int}')
  public async expectsResponse(statusCode: number) {
    this.spec.response().should.have.status(statusCode);
  }
}

export = AppRootSteps;
