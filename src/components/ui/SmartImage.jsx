import { useEffect, useRef, useState } from 'react';

export const PLACEHOLDER_IMAGE = '/images/animal-placeholder.svg';

export default function SmartImage({ src, alt, className = '', imgClassName = '', eager = false }) {
  const imgRef = useRef(null);
  const [current, setCurrent] = useState(src || PLACEHOLDER_IMAGE);
  const [ready, setReady] = useState(!src);

  useEffect(() => {
    setCurrent(src || PLACEHOLDER_IMAGE);
    setReady(!src);
  }, [src]);

  useEffect(() => {
    const node = imgRef.current;
    if (node?.complete && node.naturalWidth > 0) setReady(true);
  }, [current]);

  const handleError = () => {
    if (current !== PLACEHOLDER_IMAGE) setCurrent(PLACEHOLDER_IMAGE);
    else setReady(true);
  };

  return (
    <div className={`relative overflow-hidden bg-mist ${className}`}>
      {!ready && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      <img
        ref={imgRef}
        src={current}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        onLoad={() => setReady(true)}
        onError={handleError}
        className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out ${ready ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </div>
  );
}
