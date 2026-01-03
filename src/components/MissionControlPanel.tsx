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
    <div className="h-full flex flex-col gap-4">
      {/* Mission Status */}
      <div className="brutalist-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg tracking-[0.15em] text-foreground">
            MISSION STATUS
          </h2>
          <div className={`status-diamond ${selectedAsteroid ? 'bg-accent animate-blink' : 'bg-secondary'}`} />
        </div>
        
        <div className="text-center py-4 border-2 border-border bg-muted">
          <p className="text-[10px] text-muted-foreground tracking-widest mb-1">CURRENT TARGET</p>
          <p className="font-display text-2xl text-foreground glitch-text">
            {selectedAsteroid?.name || '---'}
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
        <div className="brutalist-panel-red p-4">
          <p className="text-[10px] text-muted-foreground tracking-widest text-center mb-2">
            TIME TO CLOSE APPROACH
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: time.days, label: 'DAYS' },
              { value: time.hours, label: 'HRS' },
              { value: time.mins, label: 'MIN' },
              { value: time.secs, label: 'SEC' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="bg-background border-2 border-primary p-2">
                  <span className="font-mono text-xl text-primary countdown-display">
                    {item.value}
                  </span>
                </div>
                <span className="text-[8px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threat Assessment Quick View */}
      {selectedAsteroid && (
        <div className="brutalist-panel p-4">
          <h3 className="font-display text-sm tracking-widest text-foreground mb-3">
            THREAT ASSESSMENT
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Impact Energy:</span>
              <span className="font-mono text-primary">{impactEnergy.toFixed(2)} MT</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Damage Radius:</span>
              <span className="font-mono text-accent">{damageRadius.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Palermo Scale:</span>
              <span className="font-mono text-foreground">{selectedAsteroid.palermoScale}</span>
            </div>
          </div>
        </div>
      )}

      {/* Agency Contributions */}
      <div className="brutalist-panel p-4 flex-1">
        <h3 className="font-display text-sm tracking-widest text-foreground mb-3">
          COALITION RESOURCES
        </h3>
        <div className="space-y-3">
          {spaceAgencies.map((agency) => (
            <div key={agency.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-xs text-foreground">{agency.code}</span>
                <span className="font-mono text-xs text-muted-foreground">{agency.contribution}%</span>
              </div>
              <div className="progress-brutal">
                <div 
                  className="progress-brutal-fill"
                  style={{ 
                    width: `${agency.contribution}%`,
                    backgroundColor: agency.color,
                  }}
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
        className={`btn-brutal-primary w-full py-4 ${!selectedAsteroid ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="text-xl">INITIATE DEFENSE MISSION</span>
      </button>
    </div>
  );
};

export default MissionControlPanel;
