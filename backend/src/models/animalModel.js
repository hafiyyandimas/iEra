import { getSupabaseClient } from '../config/supabaseClient.js';

function throwIfError(error) {
  if (error) {
    const operationError = new Error('Database operation failed.');
    operationError.cause = error;
    throw operationError;
  }
}

export async function listAnimals({ year, search } = {}) {
  let query = getSupabaseClient().from('animals').select('*').order('extinction_year').order('common_name');
  if (year !== undefined) query = query.eq('extinction_year', year);
  const { data, error } = await query;
  throwIfError(error);
  const normalizedSearch = search?.trim().toLocaleLowerCase('id');
  if (!normalizedSearch) return data || [];
  return (data || []).filter((animal) =>
    `${animal.common_name} ${animal.scientific_name}`.toLocaleLowerCase('id').includes(normalizedSearch)
  );
}

export async function findAnimalById(id) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  const column = isUuid ? 'id' : 'slug';
  const { data, error } = await getSupabaseClient()
    .from('animals')
    .select('*')
    .eq(column, id)
    .maybeSingle();
  throwIfError(error);
  return data;
}

export async function insertAnimal(animal) {
  const { data, error } = await getSupabaseClient().from('animals').insert(animal).select('*').single();
  throwIfError(error);
  return data;
}

export async function updateAnimal(id, animal) {
  const { data, error } = await getSupabaseClient().from('animals').update(animal).eq('id', id).select('*').maybeSingle();
  throwIfError(error);
  return data;
}

export async function removeAnimal(id) {
  const { data, error } = await getSupabaseClient().from('animals').delete().eq('id', id).select('id').maybeSingle();
  throwIfError(error);
  return data;
}
