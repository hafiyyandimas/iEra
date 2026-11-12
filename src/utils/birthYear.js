import { DATASET_MAX_YEAR, DATASET_MIN_YEAR } from '../app/appConfig.js';

export function getBirthYear(age, currentYear = new Date().getFullYear()) {
  const normalizedAge = Number(age);
  if (!Number.isInteger(normalizedAge) || normalizedAge < 1 || normalizedAge > 120) {
    return { valid: false, error: 'Masukkan umur berupa angka antara 1 dan 120 tahun.' };
  }
  const birthYear = currentYear - normalizedAge;
  if (birthYear < DATASET_MIN_YEAR || birthYear > DATASET_MAX_YEAR) {
    return {
      valid: false,
      birthYear,
      error: `Data hanya tersedia untuk tahun ${DATASET_MIN_YEAR}–${DATASET_MAX_YEAR}.`
    };
  }
  return { valid: true, birthYear };
}
