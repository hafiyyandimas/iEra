import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import {
  putFavorite,
  putFavorites
} from '../src/controllers/favoriteController.js';

const CATALOG_ID = '3f0c1f9e-1a2b-4c3d-8e4f-5a6b7c8d9e0f';

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

async function runController(handler, request) {
  return new Promise((resolve) => {
    const response = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        resolve({ status: this.statusCode, body });
        return this;
      }
    };
    handler(request, response, (error) => resolve({ status: error.status || 500, body: { error: error.message } }));
  });
}

test('favorite endpoints require a signed-in session', async () => {
  await withServer(async (baseUrl) => {
    const list = await fetch(`${baseUrl}/api/favorites`);
    assert.equal(list.status, 401);
    assert.equal((await list.json()).error, 'Login diperlukan.');

    const save = await fetch(`${baseUrl}/api/favorites/${CATALOG_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: '' })
    });
    assert.equal(save.status, 401);

    const remove = await fetch(`${baseUrl}/api/favorites/${CATALOG_ID}`, { method: 'DELETE' });
    assert.equal(remove.status, 401);
  });
});

test('a single favorite rejects non-catalog ids before touching the database', async () => {
  const result = await runController(putFavorite, {
    params: { animalId: 'personal-9f8e7d6c' },
    body: { note: '' },
    authUser: { id: 'user-id' }
  });
  assert.equal(result.status, 400);
  assert.match(result.body.error, /tidak valid/);
});

test('a favorite note may not exceed 500 characters', async () => {
  const result = await runController(putFavorite, {
    params: { animalId: CATALOG_ID },
    body: { note: 'x'.repeat(501) },
    authUser: { id: 'user-id' }
  });
  assert.equal(result.status, 400);
  assert.match(result.body.error, /500 karakter/);
});

test('account sync rejects a body without a favorites array', async () => {
  const result = await runController(putFavorites, {
    body: { favorites: 'nope' },
    authUser: { id: 'user-id' }
  });
  assert.equal(result.status, 400);
  assert.match(result.body.error, /array favorites/);
});

test('account sync rejects duplicate catalog entries', async () => {
  const result = await runController(putFavorites, {
    body: { favorites: [{ animalId: CATALOG_ID }, { animalId: CATALOG_ID }] },
    authUser: { id: 'user-id' }
  });
  assert.equal(result.status, 400);
  assert.match(result.body.error, /lebih dari sekali/);
});
