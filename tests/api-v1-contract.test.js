const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../index');

test('protected v1 endpoint returns the stable JSON error envelope', async () => {
  const response = await request(app).get('/api/v1/auth/me').expect(401).expect('Content-Type', /json/);
  assert.equal(response.body.data, null);
  assert.equal(response.body.error.code, 'AUTH_REQUIRED');
  assert.deepEqual(response.body.meta, {});
});

test('v1 login rate limiter and route accept JSON requests', async () => {
  const response = await request(app).post('/api/v1/auth/login').send({ username: '', password: '' });
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, 'INVALID_CREDENTIALS');
});
