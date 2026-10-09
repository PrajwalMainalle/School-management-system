import React from 'react';

export const Badge = ({
  children,
  variant = 'sky', // sky | green | warning | danger | neutral
  size = 'md', // sm | md
  icon: Icon,
}) => {
  const variantStyles = {
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    green: 'bg-ecoGreen-50 text-ecoGreen-700 border-ecoGreen-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
