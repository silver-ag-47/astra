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
    <div className="min-h-screen bg-background grid-bg">
      <div className="max-w-4xl mx-auto p-6">
        {/* Result Header */}
        <div className={`brutalist-panel-red p-8 mb-6 text-center ${success ? 'border-terminal' : ''}`}>
          <div className={`inline-block hexagon w-20 h-20 ${success ? 'bg-terminal' : 'bg-accent'} mb-4`}>
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">{success ? '✓' : '!'}</span>
            </div>
          </div>
          <h1 className={`font-display text-5xl tracking-wide mb-2 ${success ? 'text-terminal' : 'text-accent'}`}>
            {success ? 'MISSION SUCCESS' : 'PARTIAL SUCCESS'}
          </h1>
          <p className="text-lg text-muted-foreground font-serif">
            {success 
              ? 'Asteroid trajectory successfully altered. Earth is safe.'
              : 'Deflection achieved but continued monitoring required.'}
          </p>
        </div>

        {/* Mission Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Target Info */}
          <div className="brutalist-panel p-6">
            <h2 className="font-display text-lg tracking-widest text-foreground mb-4 border-b-2 border-border pb-2">
              TARGET NEUTRALIZED
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asteroid:</span>
                <span className="font-mono text-foreground">{asteroid.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diameter:</span>
                <span className="font-mono text-foreground">{asteroid.diameter}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Initial Threat:</span>
                <span className="font-mono text-primary">Torino {asteroid.torinoScale}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Final Threat:</span>
                <span className="font-mono text-terminal">Torino 0</span>
              </div>
            </div>
          </div>

          {/* Strategy Used */}
          <div className="brutalist-panel p-6">
            <h2 className="font-display text-lg tracking-widest text-foreground mb-4 border-b-2 border-border pb-2">
              DEFENSE PROTOCOL
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Strategy:</span>
                <span className="font-mono text-foreground">{strategy.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code:</span>
                <span className="font-mono text-primary">{strategy.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lead Time:</span>
                <span className="font-mono text-foreground">{strategy.leadTime} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mission Cost:</span>
                <span className="font-mono text-accent">${strategy.costBillion}B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deflection Metrics */}
        <div className="brutalist-panel p-6 mb-6">
          <h2 className="font-display text-lg tracking-widest text-foreground mb-6 border-b-2 border-border pb-2">
            DEFLECTION ANALYSIS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-4 border-2 border-terminal">
              <p className="text-[9px] text-muted-foreground tracking-widest mb-1">TRAJECTORY CHANGE</p>
              <p className="font-mono text-2xl text-terminal">{deflectionAmount.toFixed(1)}%</p>
            </div>
            <div className="bg-muted p-4 border-2 border-border">
              <p className="text-[9px] text-muted-foreground tracking-widest mb-1">ENERGY DEFLECTED</p>
              <p className="font-mono text-2xl text-foreground">{(impactEnergy * deflectionAmount / 100).toFixed(1)} MT</p>
            </div>
            <div className="bg-muted p-4 border-2 border-accent">
              <p className="text-[9px] text-muted-foreground tracking-widest mb-1">NEW MISS DISTANCE</p>
              <p className="font-mono text-2xl text-accent">{(asteroid.distance + deflectionAmount * 0.01).toFixed(3)} AU</p>
            </div>
            <div className="bg-muted p-4 border-2 border-soviet">
              <p className="text-[9px] text-muted-foreground tracking-widest mb-1">LIVES PROTECTED</p>
              <p className="font-mono text-2xl text-soviet">{livesProtected.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Before/After Visualization */}
        <div className="brutalist-panel p-6 mb-6">
          <h2 className="font-display text-lg tracking-widest text-foreground mb-4">
            TRAJECTORY COMPARISON
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="border-2 border-primary bg-primary/5 p-4">
              <p className="text-[10px] text-primary tracking-widest mb-3">▲ BEFORE DEFLECTION</p>
              <svg viewBox="0 0 200 100" className="w-full h-32">
                <circle cx="30" cy="50" r="20" fill="hsl(210, 100%, 40%)" />
                <text x="30" y="55" textAnchor="middle" fill="white" fontSize="8">EARTH</text>
                <line x1="180" y1="10" x2="30" y2="50" stroke="hsl(0, 100%, 50%)" strokeWidth="3" strokeDasharray="4 2"/>
                <polygon points="35,45 45,40 40,50" fill="hsl(0, 100%, 50%)"/>
                <circle cx="170" cy="15" r="8" fill="hsl(0, 100%, 50%)"/>
                <text x="170" y="35" textAnchor="middle" fill="hsl(0, 100%, 50%)" fontSize="6">IMPACT</text>
              </svg>
            </div>
            {/* After */}
            <div className="border-2 border-terminal bg-terminal/5 p-4">
              <p className="text-[10px] text-terminal tracking-widest mb-3">▲ AFTER DEFLECTION</p>
              <svg viewBox="0 0 200 100" className="w-full h-32">
                <circle cx="30" cy="50" r="20" fill="hsl(210, 100%, 40%)" />
                <text x="30" y="55" textAnchor="middle" fill="white" fontSize="8">EARTH</text>
                <line x1="180" y1="10" x2="60" y2="85" stroke="hsl(120, 100%, 50%)" strokeWidth="3"/>
                <circle cx="170" cy="15" r="8" fill="hsl(45, 100%, 50%)"/>
                <text x="100" y="95" textAnchor="middle" fill="hsl(120, 100%, 50%)" fontSize="6">SAFE PASSAGE</text>
              </svg>
            </div>
          </div>
        </div>

        {/* International Collaboration */}
        <div className="brutalist-panel p-6 mb-6">
          <h2 className="font-display text-lg tracking-widest text-foreground mb-4 border-b-2 border-border pb-2">
            COALITION CONTRIBUTIONS
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {spaceAgencies.map((agency) => (
              <div key={agency.id} className="text-center">
                <div 
                  className="hexagon w-12 h-12 mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: agency.color }}
                >
                  <span className="text-xs font-bold text-background">{agency.code.substring(0, 2)}</span>
                </div>
                <p className="font-mono text-xs text-foreground">{agency.code}</p>
                <p className="text-[10px] text-muted-foreground">{agency.contribution}%</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="font-serif text-sm text-muted-foreground text-center">
              "When faced with extinction, humanity united. This mission proves that planetary defense 
              requires global cooperation and shared responsibility for our common future."
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <button onClick={onNewMission} className="btn-brutal-primary py-4">
            <span className="text-lg">NEW MISSION</span>
          </button>
          <button onClick={onHome} className="btn-brutal py-4">
            <span className="text-lg">RETURN TO COMMAND</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
