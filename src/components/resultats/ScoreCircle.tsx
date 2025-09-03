interface ScoreCircleProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

const ScoreCircle = ({ score, size = 100, showLabel = true }: ScoreCircleProps) => {
  const percentage = Math.min(100, Math.max(0, score * 10));
  const hue = ((100 - percentage) * 120) / 100;
  const color = `hsl(${hue}, 70%, 50%)`;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          {/* Background circle */}
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <path
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Score text */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-baseline justify-center"
          style={{ fontSize: size * 0.25 }}
        >
          <span 
            className="font-bold leading-none"
            style={{ color }}
          >
            {score}
          </span>
          {showLabel && (
            <span 
              className="opacity-70 ml-1"
              style={{ 
                color, 
                fontSize: size * 0.15 
              }}
            >
              /10
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreCircle;
