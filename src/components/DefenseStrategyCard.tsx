import { DefenseStrategy } from '@/data/asteroids';

interface DefenseStrategyCardProps {
  strategy: DefenseStrategy;
  isSelected: boolean;
  onSelect: () => void;
  asteroidSize: 'small' | 'medium' | 'large';
}

const DefenseStrategyCard = ({ strategy, isSelected, onSelect, asteroidSize }: DefenseStrategyCardProps) => {
  const effectiveness = strategy.effectiveness[asteroidSize];
  
  const getTRLLabel = (trl: number) => {
    if (trl >= 9) return 'Flight Proven';
    if (trl >= 7) return 'Operational';
    if (trl >= 5) return 'Validated';
    if (trl >= 3) return 'Experimental';
    return 'Conceptual';
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left card-interactive p-5 ${isSelected ? 'selected' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="tag">
              {strategy.code}
            </span>
            <span className="text-[10px] text-muted-foreground">
              TRL-{strategy.techReadiness}: {getTRLLabel(strategy.techReadiness)}
            </span>
          </div>
          <h3 className="font-display text-xl text-foreground">
            {strategy.name}
          </h3>
        </div>
        {isSelected && (
          <div className="w-6 h-6 border border-foreground flex items-center justify-center bg-foreground text-background">
            <span className="text-sm">✓</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {strategy.description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="border border-border p-3">
          <p className="data-label mb-1">Success Rate</p>
          <p className="font-mono text-sm text-foreground">{(strategy.successRate * 100).toFixed(0)}%</p>
        </div>
        <div className="border border-border p-3">
          <p className="data-label mb-1">Lead Time</p>
          <p className="font-mono text-sm text-foreground">{strategy.leadTime} yrs</p>
        </div>
        <div className="border border-border p-3">
          <p className="data-label mb-1">Est. Cost</p>
          <p className="font-mono text-sm text-foreground">${strategy.costBillion}B</p>
        </div>
      </div>

      {/* Effectiveness for current target */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="data-label">
            Effectiveness vs {asteroidSize} targets
          </span>
          <span className={`font-mono text-sm ${
            effectiveness >= 0.8 ? 'success-indicator' : 
            effectiveness >= 0.5 ? 'warning-indicator' : 
            'danger-indicator'
          }`}>
            {(effectiveness * 100).toFixed(0)}%
          </span>
        </div>
        <div className="progress-artifact">
          <div 
            className="progress-artifact-fill"
            style={{ width: `${effectiveness * 100}%` }}
          />
        </div>
      </div>

      {/* Pros/Cons */}
      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <p className="data-label mb-2 success-indicator">Advantages</p>
          <ul className="space-y-1">
            {strategy.pros.slice(0, 3).map((pro, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="success-indicator">+</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="data-label mb-2 danger-indicator">Limitations</p>
          <ul className="space-y-1">
            {strategy.cons.slice(0, 3).map((con, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="danger-indicator">−</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
};

export default DefenseStrategyCard;