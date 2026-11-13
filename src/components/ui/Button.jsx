import { cloneElement, isValidElement } from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const { asChild = false, ...buttonProps } = props;
  const variants = {
    primary: 'bg-forest text-white hover:bg-forest-dark',
    secondary: 'bg-sage text-forest hover:bg-sage-dark',
    outline: 'border border-line bg-white text-forest hover:bg-mist',
    ghost: 'text-forest hover:bg-mist',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100'
  };
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`;
  if (asChild) {
    if (!isValidElement(children)) throw new Error('Button asChild requires one React element.');
    return cloneElement(children, {
      ...buttonProps,
      className: `${classes} ${children.props.className || ''}`.trim()
    });
  }
  return (
    <button
      className={classes}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
