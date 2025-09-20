import Badge from '../ui/badge/Badge';

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  const getScoreColor = (score: number) => {
    if (score < 4) return 'success';
    if (score < 7) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score < 4) return 'Faible risque';
    if (score < 7) return 'Risque modéré';
    return 'Risque élevé';
  };

  return (
    <Badge 
      variant="light" 
      color={getScoreColor(score)}
    >
      {getScoreLabel(score)} ({score}/10)
    </Badge>
  );
};

export default ScoreBadge;
