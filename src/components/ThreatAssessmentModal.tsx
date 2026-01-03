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
    if (scale === 0) return 'torino-0';
    if (scale <= 1) return 'torino-1';
    if (scale <= 4) return 'torino-2';
    if (scale <= 7) return 'torino-5';
    return 'torino-8';
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
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto artifact-panel animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="data-label mb-1">
                Threat Assessment Report
              </p>
              <h2 className="font-display text-3xl text-foreground">
                {asteroid.name}
              </h2>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {asteroid.designation}
              </p>
            </div>
            <div className={`${getTorinoClass(asteroid.torinoScale)} border border-current px-4 py-3`}>
              <p className="text-[9px] tracking-widest text-center mb-1 uppercase">Torino</p>
              <p className="font-mono text-3xl text-center">{asteroid.torinoScale}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Torino Description */}
          <div className="border border-border p-4 bg-accent/30">
            <p className="text-sm text-foreground leading-relaxed">
              {getTorinoDescription(asteroid.torinoScale)}
            </p>
          </div>

          {/* Physical Characteristics */}
          <section>
            <h3 className="font-display text-lg text-foreground mb-4 pb-2 border-b border-border">
              Physical Characteristics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Diameter', value: `${formatNumber(asteroid.diameter)} m` },
                { label: 'Mass', value: formatScientific(asteroid.mass) + ' kg' },
                { label: 'Velocity', value: `${asteroid.velocity} km/s` },
                { label: 'Orbital Period', value: `${asteroid.orbitalPeriod} years` },
              ].map((item, i) => (
                <div key={i} className="border border-border p-4">
                  <p className="data-label mb-1">{item.label}</p>
                  <p className="font-mono text-sm text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Approach Data */}
          <section>
            <h3 className="font-display text-lg text-foreground mb-4 pb-2 border-b border-border">
              Approach Parameters
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border border-border p-4">
                <p className="data-label mb-1">Close Approach Date</p>
                <p className="font-mono text-sm text-foreground">
                  {new Date(asteroid.closeApproachDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="border border-border p-4">
                <p className="data-label mb-1">Minimum Distance</p>
                <p className="font-mono text-sm text-foreground">{asteroid.distance} AU</p>
                <p className="text-[10px] text-muted-foreground">{(asteroid.distance * 149597870.7).toFixed(0)} km</p>
              </div>
              <div className="border border-border p-4">
                <p className="data-label mb-1">Impact Probability</p>
                <p className="font-mono text-sm text-foreground">{(asteroid.impactProbability * 100).toFixed(4)}%</p>
                <p className="text-[10px] text-muted-foreground">1 in {Math.round(1 / asteroid.impactProbability).toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Impact Analysis */}
          <section>
            <h3 className="font-display text-lg text-foreground mb-4 pb-2 border-b border-border">
              Impact Analysis
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Energy Calculations */}
              <div className="space-y-4">
                <div className="border border-border p-4">
                  <p className="data-label mb-1">Kinetic Energy</p>
                  <p className="font-mono text-xl text-foreground">{formatNumber(impactEnergy)} MT</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(impactEnergy / 0.015).toFixed(0)}× Hiroshima equivalent
                  </p>
                </div>
                <div className="border border-border p-4">
                  <p className="data-label mb-1">Estimated Damage Radius</p>
                  <p className="font-mono text-xl text-foreground">{formatNumber(damageRadius)} km</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Area: {formatNumber(Math.PI * damageRadius * damageRadius)} km²
                  </p>
                </div>
              </div>

              {/* Scale Ratings */}
              <div className="space-y-4">
                <div className="border border-border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="data-label">Torino Scale</p>
                    <span className={`px-2 py-0.5 ${getTorinoClass(asteroid.torinoScale)} border border-current`}>
                      {asteroid.torinoScale}/10
                    </span>
                  </div>
                  <div className="progress-artifact h-2">
                    <div 
                      className="h-full bg-foreground"
                      style={{ width: `${asteroid.torinoScale * 10}%` }}
                    />
                  </div>
                </div>
                <div className="border border-border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="data-label">Palermo Scale</p>
                    <span className="font-mono text-sm text-foreground">{asteroid.palermoScale}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {asteroid.palermoScale > 0 
                      ? 'Threat level exceeds background risk' 
                      : `${Math.abs(asteroid.palermoScale).toFixed(1)}× below background hazard level`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Discovery Info */}
          <section className="border-t border-border pt-4">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Discovered: {new Date(asteroid.discoveryDate).toLocaleDateString()}</span>
              <span className="font-mono">ID: {asteroid.id.toUpperCase()}</span>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex gap-4">
          <button onClick={onClose} className="btn-artifact flex-1 py-3">
            Close Report
          </button>
          <button onClick={onProceed} className="btn-artifact-primary flex-1 py-3">
            Select Defense Strategy →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreatAssessmentModal;