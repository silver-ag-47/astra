import { Asteroid, calculateImpactEnergy, calculateDamageRadius, getTorinoDescription } from '@/data/asteroids';

interface ThreatAssessmentModalProps {
  asteroid: Asteroid;
  onClose: () => void;
  onProceed: () => void;
}

const ThreatAssessmentModal = ({ asteroid, onClose, onProceed }: ThreatAssessmentModalProps) => {
  const impactEnergy = calculateImpactEnergy(asteroid.mass, asteroid.velocity);
  const damageRadius = calculateDamageRadius(impactEnergy);
  
  const getTorinoClass = (scale: number) => {
    if (scale === 0) return 'bg-secondary text-foreground';
    if (scale <= 1) return 'bg-terminal/80 text-background';
    if (scale <= 4) return 'bg-accent text-background';
    if (scale <= 7) return 'bg-orange-500 text-background';
    return 'bg-primary text-primary-foreground';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const formatScientific = (num: number) => {
    if (num === 0) return '0';
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const mantissa = num / Math.pow(10, exp);
    return `${mantissa.toFixed(2)} × 10^${exp}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/95 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto brutalist-panel-red animate-flash">
        {/* Header */}
        <div className="sticky top-0 bg-primary border-b-[3px] border-foreground p-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-primary-foreground/80 tracking-widest">
                ▲ THREAT ASSESSMENT REPORT ▲
              </p>
              <h2 className="font-display text-3xl text-primary-foreground tracking-wide">
                {asteroid.name}
              </h2>
              <p className="text-xs text-primary-foreground/70 font-mono">
                {asteroid.designation}
              </p>
            </div>
            <div className={`${getTorinoClass(asteroid.torinoScale)} border-[3px] border-foreground p-4`}>
              <p className="text-[9px] tracking-widest text-center mb-1">TORINO</p>
              <p className="font-display text-4xl text-center">{asteroid.torinoScale}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Torino Description */}
          <div className="emergency-alert">
            <p className="font-serif text-sm text-foreground leading-relaxed">
              {getTorinoDescription(asteroid.torinoScale)}
            </p>
          </div>

          {/* Physical Characteristics */}
          <section>
            <h3 className="font-display text-lg tracking-widest text-foreground mb-4 border-b-2 border-border pb-2">
              PHYSICAL CHARACTERISTICS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'DIAMETER', value: `${formatNumber(asteroid.diameter)} m`, highlight: false },
                { label: 'MASS', value: formatScientific(asteroid.mass) + ' kg', highlight: false },
                { label: 'VELOCITY', value: `${asteroid.velocity} km/s`, highlight: true },
                { label: 'ORBITAL PERIOD', value: `${asteroid.orbitalPeriod} years`, highlight: false },
              ].map((item, i) => (
                <div key={i} className={`p-4 border-2 ${item.highlight ? 'border-primary bg-primary/10' : 'border-border bg-muted'}`}>
                  <p className="text-[9px] text-muted-foreground tracking-widest mb-1">{item.label}</p>
                  <p className="font-mono text-lg text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Approach Data */}
          <section>
            <h3 className="font-display text-lg tracking-widest text-foreground mb-4 border-b-2 border-border pb-2">
              APPROACH PARAMETERS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border-2 border-accent bg-accent/10">
                <p className="text-[9px] text-muted-foreground tracking-widest mb-1">CLOSE APPROACH DATE</p>
                <p className="font-mono text-lg text-foreground">
                  {new Date(asteroid.closeApproachDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="p-4 border-2 border-border bg-muted">
                <p className="text-[9px] text-muted-foreground tracking-widest mb-1">MINIMUM DISTANCE</p>
                <p className="font-mono text-lg text-foreground">{asteroid.distance} AU</p>
                <p className="text-[10px] text-muted-foreground">{(asteroid.distance * 149597870.7).toFixed(0)} km</p>
              </div>
              <div className="p-4 border-2 border-primary bg-primary/10">
                <p className="text-[9px] text-muted-foreground tracking-widest mb-1">IMPACT PROBABILITY</p>
                <p className="font-mono text-lg text-primary">{(asteroid.impactProbability * 100).toFixed(4)}%</p>
                <p className="text-[10px] text-muted-foreground">1 in {Math.round(1 / asteroid.impactProbability).toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Impact Analysis */}
          <section>
            <h3 className="font-display text-lg tracking-widest text-foreground mb-4 border-b-2 border-border pb-2">
              IMPACT ANALYSIS
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Energy Calculations */}
              <div className="space-y-4">
                <div className="p-4 border-2 border-primary bg-destructive/20">
                  <p className="text-[9px] text-muted-foreground tracking-widest mb-1">KINETIC ENERGY</p>
                  <p className="font-mono text-2xl text-primary">{formatNumber(impactEnergy)} Megatons TNT</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Equivalent to {(impactEnergy / 0.015).toFixed(0)}× Hiroshima bomb
                  </p>
                </div>
                <div className="p-4 border-2 border-accent bg-accent/10">
                  <p className="text-[9px] text-muted-foreground tracking-widest mb-1">ESTIMATED DAMAGE RADIUS</p>
                  <p className="font-mono text-2xl text-accent">{formatNumber(damageRadius)} km</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Area: {formatNumber(Math.PI * damageRadius * damageRadius)} km²
                  </p>
                </div>
              </div>

              {/* Scale Ratings */}
              <div className="space-y-4">
                <div className="p-4 border-2 border-border bg-muted">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] text-muted-foreground tracking-widest">TORINO SCALE</p>
                    <span className={`px-2 py-1 ${getTorinoClass(asteroid.torinoScale)}`}>
                      {asteroid.torinoScale}/10
                    </span>
                  </div>
                  <div className="w-full bg-background border border-border h-4">
                    <div 
                      className={`h-full ${getTorinoClass(asteroid.torinoScale)}`}
                      style={{ width: `${asteroid.torinoScale * 10}%` }}
                    />
                  </div>
                </div>
                <div className="p-4 border-2 border-border bg-muted">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] text-muted-foreground tracking-widest">PALERMO SCALE</p>
                    <span className="font-mono text-foreground">{asteroid.palermoScale}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-serif">
                    {asteroid.palermoScale > 0 
                      ? 'Threat level exceeds background risk' 
                      : `${Math.abs(asteroid.palermoScale).toFixed(1)}× below background hazard level`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Discovery Info */}
          <section className="border-t-2 border-border pt-4">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Discovered: {new Date(asteroid.discoveryDate).toLocaleDateString()}</span>
              <span className="font-mono">ID: {asteroid.id.toUpperCase()}</span>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-card border-t-[3px] border-foreground p-4 flex gap-4">
          <button onClick={onClose} className="btn-brutal flex-1">
            CLOSE REPORT
          </button>
          <button onClick={onProceed} className="btn-brutal-primary flex-1">
            SELECT DEFENSE STRATEGY
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreatAssessmentModal;
