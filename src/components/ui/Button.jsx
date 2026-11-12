export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-forest text-white hover:bg-forest-dark',
    secondary: 'bg-sage text-forest hover:bg-sage-dark',
    outline: 'border border-line bg-white text-forest hover:bg-mist',
    ghost: 'text-forest hover:bg-mist',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100'
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
