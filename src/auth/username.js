const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

export function normalizeUsername(value) {
  const username = String(value ?? '').trim().toLowerCase();
  if (!USERNAME_PATTERN.test(username)) {
    throw new Error('Username harus 3-24 karakter, hanya huruf, angka, dan garis bawah.');
  }
  return username;
}
