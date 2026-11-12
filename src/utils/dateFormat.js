export function formatExtinction(animal) {
  if (animal.extinction_date && animal.date_precision === 'exact') {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${animal.extinction_date}T00:00:00Z`));
  }
  const year = animal.extinction_year;
  return animal.date_precision === 'estimated' ? `sekitar ${year}` : String(year);
}
