const rings = [
  { r: 22, dash: '1 7' },
  { r: 38, dash: '10 6' },
  { r: 54, dash: '2 8' },
  { r: 70, dash: '16 8' },
  { r: 86, dash: '3 9' }
];

export default function RingArt({ className = '' }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true" className={className}>
      <g className="ring-spin">
        {rings.map(({ r, dash }, index) => (
          <circle key={r} cx="100" cy="100" r={r} strokeDasharray={dash} opacity={1 - index * 0.14} />
        ))}
      </g>
      <circle cx="100" cy="100" r="5" fill="currentColor" stroke="none" />
    </svg>
  );
}
