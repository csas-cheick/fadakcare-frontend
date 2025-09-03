interface ScoreLegendProps {
  size?: number;
}

const ScoreLegend = ({ size = 200 }: ScoreLegendProps) => {
  return (
    <div className="w-full" style={{ maxWidth: size }}>
      {/* Gradient bar */}
      <div 
        className="h-2 rounded-full"
        style={{
          background: 'linear-gradient(to right, #10B981, #F59E0B, #EF4444)'
        }}
      />
      
      {/* Labels */}
      <div className="flex justify-between mt-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Faible
        </span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Modéré
        </span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Élevé
        </span>
      </div>
    </div>
  );
};

export default ScoreLegend;
