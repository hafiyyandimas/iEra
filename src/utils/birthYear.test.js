import test from 'node:test';
import assert from 'node:assert/strict';
import { getBirthYear } from './birthYear.js';

test('accepts ages that map to the first and last catalog years', () => {
  assert.deepEqual(getBirthYear(25, 2026), { valid: true, birthYear: 2001 });
  assert.deepEqual(getBirthYear(1, 2026), { valid: true, birthYear: 2025 });
});

test('rejects non-positive, non-integer, and out-of-range ages', () => {
  assert.equal(getBirthYear(0, 2026).valid, false);
  assert.equal(getBirthYear(-1, 2026).valid, false);
  assert.equal(getBirthYear(2.5, 2026).valid, false);
  assert.equal(getBirthYear(26, 2026).valid, false);
});
