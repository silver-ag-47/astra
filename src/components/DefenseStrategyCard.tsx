import { useState } from 'react';
import { DefenseStrategy } from '@/data/asteroids';
import { Eye, Check, X } from 'lucide-react';

interface DefenseStrategyCardProps {
  strategy: DefenseStrategy;
  isSelected: boolean;
  onSelect: () => void;
  asteroidSize: 'small' | 'medium' | 'large';
}

const DefenseStrategyCard = ({ strategy, isSelected, onSelect, asteroidSize }: DefenseStrategyCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const effectiveness = strategy.effectiveness[asteroidSize];
  
  const getTRLLabel = (trl: number) => {
    if (trl >= 9) return 'Flight Proven';
    if (trl >= 7) return 'Operational';
    if (trl >= 5) return 'Validated';
    if (trl >= 3) return 'Experimental';
    return 'Conceptual';
  };

  return (
    <div className="relative">
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
          <div className="flex items-center gap-2">
            {/* Preview Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(!showPreview);
              }}
              className={`w-8 h-8 border flex items-center justify-center transition-colors ${
                showPreview
                  ? 'bg-purple-500 border-purple-400 text-white'
                  : 'border-border text-muted-foreground hover:border-purple-400 hover:text-purple-400'
              }`}
              title="Preview details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {isSelected && (
              <div className="w-8 h-8 border border-foreground flex items-center justify-center bg-foreground text-background">
                <span className="text-sm">✓</span>
              </div>
            )}
          </div>
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

      {/* Preview Panel */}
      {showPreview && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 p-4 bg-background border border-purple-500/50 shadow-lg animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-lg font-bold text-purple-400">{strategy.name}</h4>
              <p className="text-xs text-muted-foreground font-mono">{strategy.code} System</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(false);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
          
          {/* Effectiveness by Size */}
          <div className="mb-4">
            <p className="text-[10px] text-muted-foreground uppercase mb-2">Effectiveness by Asteroid Size</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 border border-border">
                <p className="text-[10px] text-muted-foreground">Small (&lt;100m)</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted">
                    <div className="h-full bg-green-500" style={{ width: `${strategy.effectiveness.small * 100}%` }} />
                  </div>
                  <span className="text-xs text-green-500 font-mono">{(strategy.effectiveness.small * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="p-2 border border-border">
                <p className="text-[10px] text-muted-foreground">Medium (100-500m)</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted">
                    <div className="h-full bg-amber-500" style={{ width: `${strategy.effectiveness.medium * 100}%` }} />
                  </div>
                  <span className="text-xs text-amber-500 font-mono">{(strategy.effectiveness.medium * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="p-2 border border-border">
                <p className="text-[10px] text-muted-foreground">Large (&gt;500m)</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted">
                    <div className="h-full bg-red-500" style={{ width: `${strategy.effectiveness.large * 100}%` }} />
                  </div>
                  <span className="text-xs text-red-500 font-mono">{(strategy.effectiveness.large * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Full Pros & Cons */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-green-500 uppercase mb-2 flex items-center gap-1">
                <Check className="w-3 h-3" /> All Advantages
              </p>
              <ul className="space-y-1">
                {strategy.pros.map((pro, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] text-red-500 uppercase mb-2 flex items-center gap-1">
                <X className="w-3 h-3" /> All Disadvantages
              </p>
              <ul className="space-y-1">
                {strategy.cons.map((con, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Select Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
              setShowPreview(false);
            }}
            className="mt-4 w-full py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm transition-colors"
          >
            SELECT {strategy.code}
          </button>
        </div>
      )}
    </div>
  );
};

export default DefenseStrategyCard;