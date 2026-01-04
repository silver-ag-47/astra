import { useState, useEffect } from 'react';
import { Asteroid, DefenseStrategy, getMissionPhases, spaceAgencies } from '@/data/asteroids';
import { MissionOrbitalSimulation } from './MissionOrbitalSimulation';
import ImpactSimulationWrapper from './ImpactSimulationWrapper';
import DamageAssessmentOverlay from './DamageAssessmentOverlay';

interface MissionSimulationProps {
  asteroid: Asteroid;
  strategy: DefenseStrategy;
  onComplete: (success: boolean, deflectionAmount: number) => void;
  onBack: () => void;
}

type SimulationMode = 'briefing' | 'orbital' | 'impact' | 'damage';

const MissionSimulation = ({ asteroid, strategy, onComplete, onBack }: MissionSimulationProps) => {
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('briefing');
  const [missionSuccess, setMissionSuccess] = useState<boolean | null>(null);
  const [deflectionAmount, setDeflectionAmount] = useState(0);
  const [showDamageOverlay, setShowDamageOverlay] = useState(false);

  const phases = getMissionPhases();

  const startOrbitalSimulation = () => {
    setSimulationMode('orbital');
  };

  const handleOrbitalComplete = (success: boolean) => {
    setMissionSuccess(success);
    const deflection = success ? (Math.random() * 50 + 50) : (Math.random() * 30);
    setDeflectionAmount(deflection);
    
    if (success) {
      // Show success result and complete
      setTimeout(() => {
        onComplete(true, deflection);
      }, 2000);
    }
  };

  const handleShowImpact = () => {
    setSimulationMode('impact');
  };

  const handleImpactComplete = () => {
    setSimulationMode('damage');
    setShowDamageOverlay(true);
  };

  const handleDamageClose = () => {
    setShowDamageOverlay(false);
    onComplete(false, deflectionAmount);
  };

  // Orbital simulation view
  if (simulationMode === 'orbital') {
    return (
      <div className="fixed inset-0 z-40">
        <MissionOrbitalSimulation
          asteroid={asteroid}
          strategy={strategy}
          onComplete={handleOrbitalComplete}
          onShowImpact={handleShowImpact}
        />
      </div>
    );
  }

  // Impact simulation view
  if (simulationMode === 'impact') {
    return (
      <div className="fixed inset-0 z-40">
        <ImpactSimulationWrapper
          asteroid={asteroid}
          onImpactComplete={handleImpactComplete}
        />
      </div>
    );
  }

  // Damage assessment view
  if (simulationMode === 'damage') {
    return (
      <div className="fixed inset-0 z-40 bg-black">
        <DamageAssessmentOverlay
          asteroid={asteroid}
          isVisible={showDamageOverlay}
          onClose={handleDamageClose}
        />
      </div>
    );
  }

  // Briefing view (initial state)
  return (
    <div className="min-h-screen bg-background dot-grid relative overflow-hidden">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="artifact-panel p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="data-label mb-1">Mission Briefing</p>
              <h1 className="font-display text-3xl text-foreground">
                Operation: {asteroid.name} Intercept
              </h1>
            </div>
            <div className="text-right">
              <p className="data-label">Defense Protocol</p>
              <p className="font-mono text-lg text-foreground">{strategy.code}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mission Overview */}
          <div className="lg:col-span-2">
            <div className="artifact-panel p-6">
              <h2 className="font-display text-lg text-foreground mb-6">
                Mission Timeline
              </h2>
              
              {/* Phase Overview */}
              <div className="space-y-4 mb-8">
                {phases.map((phase, index) => (
                  <div 
                    key={phase.id}
                    className="p-4 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="status-dot bg-border" />
                        <span className="font-display text-base text-foreground">
                          {phase.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-5">
                      {phase.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Start Button */}
              <button
                onClick={startOrbitalSimulation}
                className="btn-artifact-primary w-full py-4 text-lg tracking-wider"
              >
                Begin Simulation →
              </button>
              
              <button
                onClick={onBack}
                className="btn-artifact w-full py-3 mt-4"
              >
                Change Strategy
              </button>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Target Info */}
            <div className="artifact-panel p-4">
              <h3 className="font-display text-sm text-foreground mb-4">
                Target Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Asteroid</span>
                  <span className="font-mono text-sm text-foreground">{asteroid.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Diameter</span>
                  <span className="font-mono text-sm text-foreground">{asteroid.diameter}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Velocity</span>
                  <span className="font-mono text-sm text-foreground">{asteroid.velocity} km/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Impact Probability</span>
                  <span className="font-mono text-sm text-red-400">{(asteroid.impactProbability * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Strategy Info */}
            <div className="artifact-panel p-4">
              <h3 className="font-display text-sm text-foreground mb-4">
                Defense Strategy
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Method</span>
                  <span className="font-mono text-sm text-foreground">{strategy.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Success Rate</span>
                  <span className="font-mono text-sm text-green-400">{(strategy.successRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Cost</span>
                  <span className="font-mono text-sm text-foreground">${strategy.costBillion}B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Lead Time</span>
                  <span className="font-mono text-sm text-foreground">{strategy.leadTime} years</span>
                </div>
              </div>
            </div>

            {/* Agency Status */}
            <div className="artifact-panel p-4">
              <h3 className="font-display text-sm text-foreground mb-3">
                Coalition Status
              </h3>
              <div className="space-y-2">
                {spaceAgencies.slice(0, 3).map((agency) => (
                  <div key={agency.id} className="flex items-center justify-between">
                    <span className="font-mono text-xs text-foreground">{agency.code}</span>
                    <div className="flex items-center gap-2">
                      <div className="status-dot bg-green-500" />
                      <span className="text-[10px] text-muted-foreground">Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionSimulation;
