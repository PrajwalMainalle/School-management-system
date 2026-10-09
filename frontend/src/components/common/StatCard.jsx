import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'sky', // sky | green | emerald | amber
}) => {
  const colorMap = {
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'border-sky-100',
      iconBg: 'bg-sky-500/10',
    },
    green: {
      bg: 'bg-ecoGreen-50',
      text: 'text-ecoGreen-600',
      border: 'border-ecoGreen-100',
      iconBg: 'bg-ecoGreen-500/10',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-500/10',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500/10',
    },
  };

  const activeColor = colorMap[colorScheme] || colorMap.sky;

  return (
    <div className={`p-5 rounded-xl border bg-white shadow-soft hover:shadow-md transition-all duration-200 ${activeColor.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${activeColor.iconBg} ${activeColor.text}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span className="font-semibold text-ecoGreen-600">{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
