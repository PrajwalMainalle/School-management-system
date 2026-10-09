import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'md', // sm | md | lg
  icon: Icon,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

  const variants = {
    primary: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500 hover:shadow-md hover:shadow-sky-200',
    secondary: 'bg-ecoGreen-600 hover:bg-ecoGreen-700 text-white focus:ring-ecoGreen-500 hover:shadow-md hover:shadow-ecoGreen-200',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 focus:ring-sky-500',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
