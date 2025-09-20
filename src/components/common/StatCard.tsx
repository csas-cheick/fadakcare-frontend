import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  subtitle?: string;
  loading?: boolean;
}

const colorStyles: Record<string, { wrapper: string }> = {
  blue:    { wrapper: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' },
  green:   { wrapper: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300' },
  teal:    { wrapper: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300' },
  emerald: { wrapper: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' },
  red:     { wrapper: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300' },
  yellow:  { wrapper: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300' },
  purple:  { wrapper: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' },
  gray:    { wrapper: 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-300' },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'teal',
  subtitle,
  loading = false,
}) => {
  const colorCls = colorStyles[color]?.wrapper || colorStyles.teal.wrapper;
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-2 text-gray-800 dark:text-gray-100">
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : (
              value.toLocaleString()
            )}
          </p>
          {subtitle && !loading && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg flex-shrink-0 ring-8 ring-opacity-60 ${colorCls.replace(' ', ' ')} ring-gray-50 dark:ring-gray-900/10`}> 
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
