import { Asteroid, DefenseStrategy, spaceAgencies, calculateImpactEnergy, calculateDamageRadius } from '@/data/asteroids';

interface ResultsPageProps {
  asteroid: Asteroid;
  strategy: DefenseStrategy;
  success: boolean;
  deflectionAmount: number;
  onNewMission: () => void;
  onHome: () => void;
}

const ResultsPage = ({ asteroid, strategy, success, deflectionAmount, onNewMission, onHome }: ResultsPageProps) => {
  const impactEnergy = calculateImpactEnergy(asteroid.mass, asteroid.velocity);
  const damageRadius = calculateDamageRadius(impactEnergy);
  const livesProtected = success ? Math.round(damageRadius * damageRadius * 1000) : 0;

  return (
    <div className="min-h-screen bg-background dot-grid">
      <div className="max-w-4xl mx-auto p-6">
        {/* Result Header */}
        <div className="artifact-panel p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-foreground mb-4">
            <span className="text-3xl">{success ? '✓' : '!'}</span>
          </div>
          <h1 className="font-display text-4xl text-foreground mb-2">
            {success ? 'Mission Success' : 'Partial Success'}
          </h1>
          <p className="text-muted-foreground">
            {success 
              ? 'Asteroid trajectory successfully altered. Earth is safe.'
              : 'Deflection achieved but continued monitoring required.'}
          </p>
        </div>

        {/* Mission Summary */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Target Info */}
          <div className="artifact-panel p-6">
            <h2 className="font-display text-lg text-foreground mb-4 pb-2 border-b border-border">
              Target Neutralized
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Asteroid</span>
                <span className="font-mono text-foreground">{asteroid.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Diameter</span>
                <span className="font-mono text-foreground">{asteroid.diameter}m</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Initial Threat</span>
                <span className="font-mono text-foreground">Torino {asteroid.torinoScale}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Final Threat</span>
                <span className="font-mono success-indicator">Torino 0</span>
              </div>
            </div>
          </div>

          {/* Strategy Used */}
          <div className="artifact-panel p-6">
            <h2 className="font-display text-lg text-foreground mb-4 pb-2 border-b border-border">
              Defense Protocol
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Strategy</span>
                <span className="font-mono text-foreground">{strategy.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Code</span>
                <span className="font-mono text-foreground">{strategy.code}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lead Time</span>
                <span className="font-mono text-foreground">{strategy.leadTime} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mission Cost</span>
                <span className="font-mono text-foreground">${strategy.costBillion}B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deflection Metrics */}
        <div className="artifact-panel p-6 mb-6">
          <h2 className="font-display text-lg text-foreground mb-6 pb-2 border-b border-border">
            Deflection Analysis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-border p-4">
              <p className="data-label mb-1">Trajectory Change</p>
              <p className="font-mono text-xl text-foreground">{deflectionAmount.toFixed(1)}%</p>
            </div>
            <div className="border border-border p-4">
              <p className="data-label mb-1">Energy Deflected</p>
              <p className="font-mono text-xl text-foreground">{(impactEnergy * deflectionAmount / 100).toFixed(1)} MT</p>
            </div>
            <div className="border border-border p-4">
              <p className="data-label mb-1">New Miss Distance</p>
              <p className="font-mono text-xl text-foreground">{(asteroid.distance + deflectionAmount * 0.01).toFixed(3)} AU</p>
            </div>
            <div className="border border-border p-4">
              <p className="data-label mb-1">Lives Protected</p>
              <p className="font-mono text-xl text-foreground">{livesProtected.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Before/After Visualization */}
        <div className="artifact-panel p-6 mb-6">
          <h2 className="font-display text-lg text-foreground mb-4">
            Trajectory Comparison
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="border border-border p-4">
              <p className="data-label mb-3">Before Deflection</p>
              <svg viewBox="0 0 200 100" className="w-full h-32">
                <circle cx="30" cy="50" r="20" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1" />
                <text x="30" y="54" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="IBM Plex Mono">Earth</text>
                <line x1="180" y1="10" x2="30" y2="50" stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="4 2"/>
                <circle cx="170" cy="15" r="6" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1"/>
                <text x="170" y="35" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="7" fontFamily="IBM Plex Mono">Impact</text>
              </svg>
            </div>
            {/* After */}
            <div className="border border-border p-4">
              <p className="data-label mb-3 success-indicator">After Deflection</p>
              <svg viewBox="0 0 200 100" className="w-full h-32">
                <circle cx="30" cy="50" r="20" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1" />
                <text x="30" y="54" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="IBM Plex Mono">Earth</text>
                <line x1="180" y1="10" x2="60" y2="85" stroke="hsl(var(--foreground))" strokeWidth="1"/>
                <circle cx="170" cy="15" r="6" fill="hsl(var(--foreground))" stroke="hsl(var(--foreground))" strokeWidth="1"/>
                <text x="100" y="95" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="7" fontFamily="IBM Plex Mono">Safe Passage</text>
              </svg>
            </div>
          </div>
        </div>

        {/* International Collaboration */}
        <div className="artifact-panel p-6 mb-6">
          <h2 className="font-display text-lg text-foreground mb-4 pb-2 border-b border-border">
            Coalition Contributions
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {spaceAgencies.map((agency) => (
              <div key={agency.id} className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center border border-foreground">
                  <span className="text-xs font-mono text-foreground">{agency.code.substring(0, 2)}</span>
                </div>
                <p className="font-mono text-xs text-foreground">{agency.code}</p>
                <p className="text-[10px] text-muted-foreground">{agency.contribution}%</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center italic">
              "When faced with extinction, humanity united. This mission proves that planetary defense 
              requires global cooperation and shared responsibility for our common future."
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <button onClick={onNewMission} className="btn-artifact-primary py-4">
            New Mission →
          </button>
          <button onClick={onHome} className="btn-artifact py-4">
            Return to Command
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;