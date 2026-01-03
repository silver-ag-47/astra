import { Asteroid, calculateImpactEnergy, getTorinoDescription } from '@/data/asteroids';

interface AsteroidCardProps {
  asteroid: Asteroid;
  onClick: () => void;
  isSelected: boolean;
}

const AsteroidCard = ({ asteroid, onClick, isSelected }: AsteroidCardProps) => {
  const impactEnergy = calculateImpactEnergy(asteroid.mass, asteroid.velocity);
  
  const getTorinoClass = (scale: number) => {
    if (scale === 0) return 'bg-secondary';
    if (scale <= 1) return 'bg-terminal/80';
    if (scale <= 4) return 'bg-accent';
    if (scale <= 7) return 'bg-orange-500';
    return 'bg-primary';
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
      className={`w-full text-left transition-all duration-150 ${
        isSelected 
          ? 'brutalist-panel-red translate-x-2' 
          : 'brutalist-panel hover:-translate-y-1 hover:translate-x-1'
      }`}
    >
      <div className="p-4">
        {/* Header with Name and Torino Badge */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display text-xl tracking-wide text-foreground">
              {asteroid.name}
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono">
              {asteroid.designation}
            </p>
          </div>
          <div className={`${getTorinoClass(asteroid.torinoScale)} px-2 py-1 border-2 border-foreground`}>
            <span className="font-display text-lg text-foreground">{asteroid.torinoScale}</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted p-2 border border-border">
            <p className="text-[9px] text-muted-foreground tracking-wider">DIAMETER</p>
            <p className="font-mono text-sm text-foreground">{asteroid.diameter}m</p>
          </div>
          <div className="bg-muted p-2 border border-border">
            <p className="text-[9px] text-muted-foreground tracking-wider">VELOCITY</p>
            <p className="font-mono text-sm text-foreground">{asteroid.velocity} km/s</p>
          </div>
        </div>

        {/* Impact Probability Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] text-muted-foreground tracking-wider">IMPACT PROBABILITY</span>
            <span className="font-mono text-xs text-primary">
              {(asteroid.impactProbability * 100).toFixed(4)}%
            </span>
          </div>
          <div className="progress-brutal">
            <div 
              className="progress-brutal-fill bg-primary"
              style={{ width: `${Math.min(asteroid.impactProbability * 1000, 100)}%` }}
            />
          </div>
        </div>

        {/* Approach Date */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground font-serif">Close Approach:</span>
          <div className="text-right">
            <span className="font-mono text-foreground">{formatDate(asteroid.closeApproachDate)}</span>
            <span className={`block text-[10px] ${daysUntil < 365 ? 'text-primary' : daysUntil < 3650 ? 'text-accent' : 'text-terminal'}`}>
              {daysUntil > 0 ? `T-${daysUntil.toLocaleString()} days` : 'PASSED'}
            </span>
          </div>
        </div>

        {/* Impact Energy Indicator */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-muted-foreground tracking-wider">EST. IMPACT ENERGY</span>
            <span className={`font-mono text-sm ${impactEnergy > 100 ? 'text-primary' : impactEnergy > 1 ? 'text-accent' : 'text-terminal'}`}>
              {impactEnergy.toFixed(2)} MT
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default AsteroidCard;
