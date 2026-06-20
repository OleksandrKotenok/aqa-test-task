import { test, expect } from '@playwright/test';

// API tests against the public Automation Exercise API.
// Docs: https://automationexercise.com/api_list
//
// Note: this API always returns HTTP 200 and puts the real result code
// inside the JSON body field "responseCode". So we parse the body and
// assert on that field instead of the HTTP status.
const BASE_URL = 'https://automationexercise.com/api';

test.describe('Automation Exercise API', () => {
  // API-001 - positive case
  test('GET /productsList returns the products list', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/productsList`);

    // The HTTP transport itself is OK.
    expect(response.ok()).toBeTruthy();

    // The API reports its own status code inside the body.
    const body = JSON.parse(await response.text());
    expect(body.responseCode).toBe(200);

    // We should get a non-empty list of products with the expected shape.
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
    expect(body.products[0]).toHaveProperty('id');
    expect(body.products[0]).toHaveProperty('name');
  });

  // API-002 - negative case
  test('POST /verifyLogin without email returns a 400 error in the body', async ({ request }) => {
    // Send only the password, leaving out the required email parameter.
    const response = await request.post(`${BASE_URL}/verifyLogin`, {
      multipart: {
        password: 'Password123!',
      },
    });

    const body = JSON.parse(await response.text());
    expect(body.responseCode).toBe(400);
    expect(body.message).toBe(
      'Bad request, email or password parameter is missing in POST request.',
    );
  });
});
