import { useState, useEffect } from 'react';
import { spaceAgencies, Asteroid, calculateImpactEnergy, calculateDamageRadius } from '@/data/asteroids';

interface MissionControlPanelProps {
  selectedAsteroid: Asteroid | null;
  onLaunchMission: () => void;
}

const MissionControlPanel = ({ selectedAsteroid, onLaunchMission }: MissionControlPanelProps) => {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (selectedAsteroid) {
      const target = new Date(selectedAsteroid.closeApproachDate);
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      setCountdown(Math.ceil(diff / 1000));
    }
  }, [selectedAsteroid]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return {
      days: days.toString().padStart(4, '0'),
      hours: hours.toString().padStart(2, '0'),
      mins: mins.toString().padStart(2, '0'),
      secs: secs.toString().padStart(2, '0'),
    };
  };

  const time = countdown ? formatCountdown(countdown) : null;

  const impactEnergy = selectedAsteroid ? calculateImpactEnergy(selectedAsteroid.mass, selectedAsteroid.velocity) : 0;
  const damageRadius = selectedAsteroid ? calculateDamageRadius(impactEnergy) : 0;

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Mission Status */}
      <div className="artifact-panel p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-foreground">
            Mission Status
          </h2>
          <div className={`status-dot ${selectedAsteroid ? 'bg-warning status-dot-pulse' : 'bg-muted'}`} />
        </div>
        
        <div className="text-center py-4 border border-border">
          <p className="data-label mb-1">Current Target</p>
          <p className="font-display text-2xl text-foreground">
            {selectedAsteroid?.name || '—'}
          </p>
          {selectedAsteroid && (
            <p className="text-[10px] text-muted-foreground font-mono mt-1">
              {selectedAsteroid.designation}
            </p>
          )}
        </div>
      </div>

      {/* Countdown Timer */}
      {time && (
        <div className="artifact-panel p-4">
          <p className="data-label text-center mb-3">
            Time to Close Approach
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: time.days, label: 'Days' },
              { value: time.hours, label: 'Hrs' },
              { value: time.mins, label: 'Min' },
              { value: time.secs, label: 'Sec' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="border border-border py-2">
                  <span className="font-mono text-lg text-foreground countdown-display">
                    {item.value}
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threat Assessment Quick View */}
      {selectedAsteroid && (
        <div className="artifact-panel p-4">
          <h3 className="font-display text-sm text-foreground mb-4">
            Threat Assessment
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Impact Energy</span>
              <span className="font-mono text-foreground">{impactEnergy.toFixed(2)} MT</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Damage Radius</span>
              <span className="font-mono text-foreground">{damageRadius.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Palermo Scale</span>
              <span className="font-mono text-foreground">{selectedAsteroid.palermoScale}</span>
            </div>
          </div>
        </div>
      )}

      {/* Agency Contributions */}
      <div className="artifact-panel p-4 flex-1">
        <h3 className="font-display text-sm text-foreground mb-4">
          Coalition Resources
        </h3>
        <div className="space-y-4">
          {spaceAgencies.map((agency) => (
            <div key={agency.id}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono text-xs text-foreground">{agency.code}</span>
                <span className="font-mono text-xs text-muted-foreground">{agency.contribution}%</span>
              </div>
              <div className="progress-artifact">
                <div 
                  className="progress-artifact-fill"
                  style={{ width: `${agency.contribution}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Button */}
      <button
        onClick={onLaunchMission}
        disabled={!selectedAsteroid}
        className={`btn-artifact-primary w-full py-3 ${!selectedAsteroid ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        Initiate Defense Mission →
      </button>
    </div>
  );
};

export default MissionControlPanel;