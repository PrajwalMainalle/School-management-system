import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  ecoBorder = false,
  glass = false,
}) => {
  return (
    <div
      className={`rounded-xl border bg-white shadow-soft transition-all duration-200 ${
        ecoBorder ? 'border-l-4 border-l-ecoGreen-500 border-slate-200' : 'border-slate-200/80'
      } ${glass ? 'glass-panel' : ''} ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

export default Card;
