import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `scrypt$16384$8$1$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  const parts = typeof storedHash === 'string' ? storedHash.split('$') : [];
  if (
    parts.length !== 6
    || parts[0] !== 'scrypt'
    || parts[1] !== '16384'
    || parts[2] !== '8'
    || parts[3] !== '1'
    || !/^[0-9a-f]{32}$/i.test(parts[4])
    || !/^[0-9a-f]{128}$/i.test(parts[5])
  ) {
    return false;
  }

  const salt = Buffer.from(parts[4], 'hex');
  const expectedKey = Buffer.from(parts[5], 'hex');
  const actualKey = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return timingSafeEqual(expectedKey, actualKey);
}
