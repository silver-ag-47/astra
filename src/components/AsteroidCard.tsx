import { Asteroid, calculateImpactEnergy } from '@/data/asteroids';

interface AsteroidCardProps {
  asteroid: Asteroid;
  onClick: () => void;
  isSelected: boolean;
}

const AsteroidCard = ({ asteroid, onClick, isSelected }: AsteroidCardProps) => {
  const impactEnergy = calculateImpactEnergy(asteroid.mass, asteroid.velocity);
  
  const getTorinoClass = (scale: number) => {
    if (scale === 0) return 'torino-0';
    if (scale <= 1) return 'torino-1';
    if (scale <= 4) return 'torino-2';
    if (scale <= 7) return 'torino-5';
    return 'torino-8';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntil = getDaysUntil(asteroid.closeApproachDate);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left card-interactive p-4 ${isSelected ? 'selected' : ''}`}
    >
      {/* Header with Name and Torino Badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg text-foreground">
            {asteroid.name}
          </h3>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {asteroid.designation}
          </p>
        </div>
        <div className={`${getTorinoClass(asteroid.torinoScale)} px-2 py-0.5 border border-current`}>
          <span className="font-mono text-xs">{asteroid.torinoScale}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="data-label">Diameter</p>
          <p className="data-value">{asteroid.diameter}m</p>
        </div>
        <div>
          <p className="data-label">Velocity</p>
          <p className="data-value">{asteroid.velocity} km/s</p>
        </div>
      </div>

      {/* Impact Probability */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="data-label">Impact Probability</span>
          <span className="font-mono text-xs text-foreground">
            {(asteroid.impactProbability * 100).toFixed(4)}%
          </span>
        </div>
        <div className="progress-artifact">
          <div 
            className="progress-artifact-fill"
            style={{ width: `${Math.min(asteroid.impactProbability * 1000, 100)}%` }}
          />
        </div>
      </div>

      {/* Approach Date */}
      <div className="flex justify-between items-center text-xs border-t border-border pt-3">
        <span className="text-muted-foreground">Close Approach</span>
        <div className="text-right">
          <span className="font-mono text-foreground">{formatDate(asteroid.closeApproachDate)}</span>
          <span className={`block text-[10px] ${
            daysUntil < 365 ? 'danger-indicator' : 
            daysUntil < 3650 ? 'warning-indicator' : 
            'success-indicator'
          }`}>
            {daysUntil > 0 ? `T-${daysUntil.toLocaleString()} days` : 'PASSED'}
          </span>
        </div>
      </div>

      {/* Impact Energy */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
        <span className="data-label">Est. Impact Energy</span>
        <span className={`font-mono text-sm ${
          impactEnergy > 100 ? 'danger-indicator' : 
          impactEnergy > 1 ? 'warning-indicator' : 
          'success-indicator'
        }`}>
          {impactEnergy.toFixed(2)} MT
        </span>
      </div>
    </button>
  );
};

export default AsteroidCard;