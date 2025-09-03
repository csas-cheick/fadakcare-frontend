import React from 'react';

interface DonutChartProps {
  moyenneScore: number;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ moyenneScore, size = 200 }) => {
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(moyenneScore / 10, 1); // Score max 10
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage * circumference);

  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 7) return '#ef4444'; // red-500
    if (score >= 4) return '#f59e0b'; // yellow-500
    return '#10b981'; // green-500
  };

  const color = getColor(moyenneScore);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="12"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {moyenneScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">/ 10</div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
