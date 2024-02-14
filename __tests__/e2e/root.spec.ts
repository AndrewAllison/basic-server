import { e2e } from 'pactum';

const apiBaseUrl = process.env.API_TEST_URL || 'http://localhost:6006';

describe('root', () => {
  it('should return details', async () => {
    const test_case = e2e('Add User');

    const step1 = test_case.step('Post User');

    await step1.spec().get(apiBaseUrl).expectStatus(200);
  });
});
