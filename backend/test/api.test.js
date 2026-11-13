import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import app from '../src/app.js';
import vercelHandler from '../../api/index.js';

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

test('catalog write routes require the server-side admin token', async () => {
  const originalToken = process.env.API_ADMIN_TOKEN;
  process.env.API_ADMIN_TOKEN = 'test-only-admin-token';
  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/animals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert.equal(response.status, 401);
    });
  } finally {
    if (originalToken === undefined) delete process.env.API_ADMIN_TOKEN;
    else process.env.API_ADMIN_TOKEN = originalToken;
  }
});
