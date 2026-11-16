import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/auth/password.js';
import { createRequireAuth } from '../src/middleware/requireAuth.js';
import { hashSessionToken } from '../src/auth/session.js';

test('password hashes verify without storing plaintext', async () => {
  const password = 'correct horse battery staple';
  const passwordHash = await hashPassword(password);
  assert.notEqual(passwordHash, password);
  assert.match(passwordHash, /^scrypt\$16384\$8\$1\$/);
  assert.equal(await verifyPassword(password, passwordHash), true);
  assert.equal(await verifyPassword('wrong password', passwordHash), false);
  assert.equal(await verifyPassword(password, 'invalid-hash'), false);
});

test('session middleware authenticates a valid HttpOnly cookie token', async () => {
  const token = 'a'.repeat(64);
  let queriedHash;
  const middleware = createRequireAuth(async (tokenHash) => {
    queriedHash = tokenHash;
    return { user: { id: 'user-id', username: 'test_user', role: 'user' } };
  });
  const request = { get: () => `other=value; iera_session=${token}` };
  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    clearCookie() {}
  };
  let nextCalled = false;

  await middleware(request, response, () => { nextCalled = true; });

  assert.equal(queriedHash, hashSessionToken(token));
  assert.equal(nextCalled, true);
  assert.equal(request.authUser.username, 'test_user');
});

test('session middleware rejects missing cookies without querying storage', async () => {
  let queryCalled = false;
  const middleware = createRequireAuth(async () => {
    queryCalled = true;
    return null;
  });
  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };

  await middleware({ get: () => '' }, response, () => assert.fail('Missing session must not pass.'));

  assert.equal(response.statusCode, 401);
  assert.equal(queryCalled, false);
});
