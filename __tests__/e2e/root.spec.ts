import { e2e } from 'pactum';

describe('root', () => {
  it('should return details', async () => {
    const test_case = e2e('Add User');

    const step1 = test_case.step('Post User');

    await step1.spec().get('http://localhost:6006').expectStatus(200);
  });
});
