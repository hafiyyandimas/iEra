import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import app from '../src/app.js';
import vercelHandler from '../../api/index.js';
import { createRequireAdmin } from '../src/middleware/requireAdmin.js';

async function withServer(run) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

async function withVercelFunction(run) {
  const server = createServer(vercelHandler);
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('health endpoint responds without database configuration', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, status: 'ok' });
  });
});

test('root Vercel function forwards rewritten health route', async () => {
  await withVercelFunction(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/index?path=health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, status: 'ok' });

    const invalidYear = await fetch(`${baseUrl}/api/index?path=animals/year/2026`);
    assert.equal(invalidYear.status, 400);
  });
});

test('year endpoint rejects years outside the supported catalog range', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/animals/year/2026`);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).success, false);
  });
});

test('catalog write routes require an authenticated admin', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/animals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(response.status, 401);
  });
});

function adminMiddlewareResponse() {
  return {
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
}

function makeAdminMiddleware(role) {
  return createRequireAdmin(() => ({
    auth: {
      async getUser(token) {
        return { data: { user: token === 'valid-token' ? { id: 'user-id' } : null }, error: null };
      }
    },
    from(table) {
      assert.equal(table, 'profiles');
      const query = {
        select() { return query; },
        eq(column, value) {
          assert.equal(column, 'id');
          assert.equal(value, 'user-id');
          return query;
        },
        async maybeSingle() { return { data: role ? { role } : null, error: null }; }
      };
      return query;
    }
  }));
}

test('authenticated user role cannot write the official catalog', async () => {
  const middleware = makeAdminMiddleware('user');
  const response = adminMiddlewareResponse();
  await middleware({ get: () => 'Bearer valid-token' }, response, () => assert.fail('User role must not pass.'));
  assert.equal(response.statusCode, 403);
});

test('admin role is accepted by the catalog write guard', async () => {
  const middleware = makeAdminMiddleware('admin');
  const response = adminMiddlewareResponse();
  let nextCalled = false;
  const request = { get: () => 'Bearer valid-token' };
  await middleware(request, response, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(request.authUser.id, 'user-id');
});
