import { useState } from 'react';
import { Asteroid, DefenseStrategy, defenseStrategies } from '@/data/asteroids';
import DefenseStrategyCard from './DefenseStrategyCard';

interface StrategiesPageProps {
  asteroid: Asteroid;
  onSelectStrategy: (strategy: DefenseStrategy) => void;
  onBack: () => void;
}

const StrategiesPage = ({ asteroid, onSelectStrategy, onBack }: StrategiesPageProps) => {
  const [selectedStrategy, setSelectedStrategy] = useState<DefenseStrategy | null>(null);

  const getAsteroidSize = (diameter: number): 'small' | 'medium' | 'large' => {
    if (diameter < 100) return 'small';
    if (diameter < 500) return 'medium';
    return 'large';
  };

  const asteroidSize = getAsteroidSize(asteroid.diameter);

  const handleProceed = () => {
    if (selectedStrategy) {
      onSelectStrategy(selectedStrategy);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="brutalist-panel p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[10px] text-primary tracking-widest mb-1">SELECT DEFENSE PROTOCOL</p>
              <h1 className="font-display text-3xl text-foreground tracking-wide">
                DEFENSE STRATEGY SELECTION
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[9px] text-muted-foreground tracking-widest">TARGET</p>
                <p className="font-display text-xl text-primary">{asteroid.name}</p>
              </div>
              <div className={`px-3 py-1 border-2 border-border ${
                asteroidSize === 'small' ? 'bg-terminal/20 text-terminal' :
                asteroidSize === 'medium' ? 'bg-accent/20 text-accent' :
                'bg-primary/20 text-primary'
              }`}>
                <span className="font-mono text-sm">{asteroidSize.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Comparison Info */}
        <div className="emergency-alert mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="font-serif text-sm text-foreground">
              Select a defense strategy based on target characteristics. 
              <span className="text-primary"> {asteroid.diameter}m diameter</span> asteroid classified as 
              <span className="text-accent"> {asteroidSize} target</span>.
            </p>
            <div className="text-[10px] text-muted-foreground tracking-wider">
              TORINO: {asteroid.torinoScale} | PALERMO: {asteroid.palermoScale}
            </div>
          </div>
        </div>

        {/* Strategy Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {defenseStrategies.map((strategy) => (
            <DefenseStrategyCard
              key={strategy.id}
              strategy={strategy}
              isSelected={selectedStrategy?.id === strategy.id}
              onSelect={() => setSelectedStrategy(strategy)}
              asteroidSize={asteroidSize}
            />
          ))}
        </div>

        {/* Comparison Table */}
        {selectedStrategy && (
          <div className="brutalist-panel p-6 mb-6 animate-slide-up">
            <h2 className="font-display text-lg tracking-widest text-foreground mb-4">
              STRATEGY ANALYSIS: {selectedStrategy.name.toUpperCase()}
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 border-2 border-border">
                <p className="text-[9px] text-muted-foreground tracking-widest mb-2">MISSION PROBABILITY</p>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-3xl text-terminal">
                    {(selectedStrategy.successRate * selectedStrategy.effectiveness[asteroidSize] * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-muted-foreground mb-1">combined success rate</span>
                </div>
              </div>
              <div className="bg-muted p-4 border-2 border-border">
                <p className="text-[9px] text-muted-foreground tracking-widest mb-2">TIME REQUIREMENT</p>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-3xl text-accent">{selectedStrategy.leadTime}</span>
                  <span className="text-xs text-muted-foreground mb-1">years minimum</span>
                </div>
              </div>
              <div className="bg-muted p-4 border-2 border-border">
                <p className="text-[9px] text-muted-foreground tracking-widest mb-2">TECHNOLOGY READINESS</p>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-3xl text-foreground">TRL-{selectedStrategy.techReadiness}</span>
                  <span className="text-xs text-muted-foreground mb-1">maturity level</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button onClick={onBack} className="btn-brutal flex-1">
            ← BACK TO DASHBOARD
          </button>
          <button 
            onClick={handleProceed}
            disabled={!selectedStrategy}
            className={`btn-brutal-primary flex-1 ${!selectedStrategy ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            PROCEED TO SIMULATION →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategiesPage;
