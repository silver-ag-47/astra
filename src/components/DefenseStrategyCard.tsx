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
    if (trl >= 9) return 'FLIGHT PROVEN';
    if (trl >= 7) return 'OPERATIONAL';
    if (trl >= 5) return 'VALIDATED';
    if (trl >= 3) return 'EXPERIMENTAL';
    return 'CONCEPTUAL';
  };

  const getTRLColor = (trl: number) => {
    if (trl >= 9) return 'text-terminal bg-terminal/20';
    if (trl >= 7) return 'text-accent bg-accent/20';
    if (trl >= 5) return 'text-foreground bg-secondary';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left transition-all duration-150 ${
        isSelected 
          ? 'brutalist-panel-red scale-[1.02]' 
          : 'brutalist-panel hover:-translate-y-1'
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-primary bg-primary/20 px-2 py-0.5 border border-primary">
                {strategy.code}
              </span>
              <span className={`text-[9px] px-2 py-0.5 border border-border ${getTRLColor(strategy.techReadiness)}`}>
                TRL-{strategy.techReadiness}: {getTRLLabel(strategy.techReadiness)}
              </span>
            </div>
            <h3 className="font-display text-2xl tracking-wide text-foreground">
              {strategy.name}
            </h3>
          </div>
          {isSelected && (
            <div className="hexagon w-8 h-8 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-lg">✓</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="font-serif text-sm text-muted-foreground mb-4 leading-relaxed">
          {strategy.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-muted p-3 border border-border">
            <p className="text-[9px] text-muted-foreground tracking-widest mb-1">SUCCESS RATE</p>
            <p className="font-mono text-lg text-terminal">{(strategy.successRate * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-muted p-3 border border-border">
            <p className="text-[9px] text-muted-foreground tracking-widest mb-1">LEAD TIME</p>
            <p className="font-mono text-lg text-accent">{strategy.leadTime} yrs</p>
          </div>
          <div className="bg-muted p-3 border border-border">
            <p className="text-[9px] text-muted-foreground tracking-widest mb-1">EST. COST</p>
            <p className="font-mono text-lg text-foreground">${strategy.costBillion}B</p>
          </div>
        </div>

        {/* Effectiveness for current target */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] text-muted-foreground tracking-widest">
              EFFECTIVENESS VS {asteroidSize.toUpperCase()} TARGETS
            </span>
            <span className={`font-mono text-sm ${
              effectiveness >= 0.8 ? 'text-terminal' : 
              effectiveness >= 0.5 ? 'text-accent' : 
              'text-primary'
            }`}>
              {(effectiveness * 100).toFixed(0)}%
            </span>
          </div>
          <div className="progress-brutal">
            <div 
              className={`progress-brutal-fill ${
                effectiveness >= 0.8 ? 'bg-terminal' : 
                effectiveness >= 0.5 ? 'bg-accent' : 
                'bg-primary'
              }`}
              style={{ width: `${effectiveness * 100}%` }}
            />
          </div>
        </div>

        {/* Pros/Cons */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-terminal tracking-widest mb-2">▲ ADVANTAGES</p>
            <ul className="space-y-1">
              {strategy.pros.slice(0, 3).map((pro, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-terminal mt-0.5">+</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[9px] text-primary tracking-widest mb-2">▼ LIMITATIONS</p>
            <ul className="space-y-1">
              {strategy.cons.slice(0, 3).map((con, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">−</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </button>
  );
};

export default DefenseStrategyCard;
