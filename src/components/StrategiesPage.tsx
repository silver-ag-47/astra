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
    <div className="min-h-screen bg-background dot-grid">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="artifact-panel p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="data-label mb-1">Select Defense Protocol</p>
              <h1 className="font-display text-3xl text-foreground">
                Defense Strategy Selection
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="data-label">Target</p>
                <p className="font-display text-xl text-foreground">{asteroid.name}</p>
              </div>
              <div className="tag">
                {asteroidSize}
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Comparison Info */}
        <div className="artifact-panel p-4 mb-6 bg-accent/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-foreground">
              Select a defense strategy based on target characteristics. 
              <span className="font-mono"> {asteroid.diameter}m diameter</span> asteroid classified as 
              <span className="font-mono"> {asteroidSize} target</span>.
            </p>
            <div className="text-[10px] text-muted-foreground tracking-wider font-mono">
              Torino: {asteroid.torinoScale} · Palermo: {asteroid.palermoScale}
            </div>
          </div>
        </div>

        {/* Strategy Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
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
          <div className="artifact-panel p-6 mb-6 animate-fade-in">
            <h2 className="font-display text-lg text-foreground mb-4">
              Strategy Analysis: {selectedStrategy.name}
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-border p-4">
                <p className="data-label mb-2">Mission Probability</p>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-2xl text-foreground">
                    {(selectedStrategy.successRate * selectedStrategy.effectiveness[asteroidSize] * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-muted-foreground mb-1">combined</span>
                </div>
              </div>
              <div className="border border-border p-4">
                <p className="data-label mb-2">Time Requirement</p>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-2xl text-foreground">{selectedStrategy.leadTime}</span>
                  <span className="text-xs text-muted-foreground mb-1">years minimum</span>
                </div>
              </div>
              <div className="border border-border p-4">
                <p className="data-label mb-2">Technology Readiness</p>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-2xl text-foreground">TRL-{selectedStrategy.techReadiness}</span>
                  <span className="text-xs text-muted-foreground mb-1">maturity</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button onClick={onBack} className="btn-artifact flex-1 py-3">
            ← Back to Dashboard
          </button>
          <button 
            onClick={handleProceed}
            disabled={!selectedStrategy}
            className={`btn-artifact-primary flex-1 py-3 ${!selectedStrategy ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            Proceed to Simulation →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategiesPage;