import AnimalCard from './AnimalCard.jsx';
import EmptyState from '../feedback/EmptyState.jsx';

export default function AnimalList({ animals, favoriteIds, onAddFavorite }) {
  if (!animals.length) {
    return <EmptyState title="Belum ada data untuk tahun ini" description="Katalog belum berisi spesies yang dapat ditampilkan untuk tahun pilihan. Data faktual akan muncul setelah katalog tervalidasi diimpor." />;
  }
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {animals.map((animal) => (
        <AnimalCard
          key={animal.id}
          animal={animal}
          isFavorite={favoriteIds.has(animal.id)}
          onAddFavorite={onAddFavorite}
        />
      ))}
    </div>
  );
}
