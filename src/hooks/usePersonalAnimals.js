import { useCallback, useEffect, useState } from 'react';
import { getPersonalAnimals, savePersonalAnimals } from '../storage/localCache.js';

function createId() {
  if (globalThis.crypto?.randomUUID) return `personal-${globalThis.crypto.randomUUID()}`;
  return `personal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function usePersonalAnimals() {
  const [animals, setAnimals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setAnimals(getPersonalAnimals());
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  const commit = useCallback((next) => {
    try {
      savePersonalAnimals(next);
      setAnimals(next);
      setError('');
      return true;
    } catch (saveError) {
      setError(saveError.message);
      return false;
    }
  }, []);

  const createAnimal = useCallback((animal) => {
    const created = {
      ...animal,
      id: createId(),
      is_personal: true,
      year_is_estimated: Boolean(animal.year_is_estimated),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return commit([created, ...animals]);
  }, [animals, commit]);

  const updateAnimal = useCallback((id, changes) => (
    commit(animals.map((animal) => animal.id === id
      ? { ...animal, ...changes, updated_at: new Date().toISOString() }
      : animal))
  ), [animals, commit]);

  const deleteAnimal = useCallback((id) => (
    commit(animals.filter((animal) => animal.id !== id))
  ), [animals, commit]);

  return { animals, error, createAnimal, updateAnimal, deleteAnimal };
}
