import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';

export default function FavoriteHeart({ active, size = 17 }) {
  const previous = useRef(active);
  const [pops, setPops] = useState(0);

  useEffect(() => {
    if (active && !previous.current) setPops((count) => count + 1);
    previous.current = active;
  }, [active]);

  return (
    <Heart
      key={pops}
      size={size}
      fill={active ? 'currentColor' : 'none'}
      className={active && pops > 0 ? 'heart-pop' : ''}
      aria-hidden="true"
    />
  );
}
