import { useState } from 'react';
import { Asteroid, DefenseStrategy, getMissionPhases, spaceAgencies } from '@/data/asteroids';

interface MissionSimulationProps {
  asteroid: Asteroid;
  strategy: DefenseStrategy;
  onComplete: (success: boolean, deflectionAmount: number) => void;
  onBack: () => void;
}

const MissionSimulation = ({ asteroid, strategy, onComplete, onBack }: MissionSimulationProps) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [deflectionProgress, setDeflectionProgress] = useState(0);
  const [showCompletionEffect, setShowCompletionEffect] = useState(false);
  const [missionSuccess, setMissionSuccess] = useState<boolean | null>(null);

  const phases = getMissionPhases();

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const startSimulation = () => {
    setIsRunning(true);
    setLogs([]);
    
    // Instant simulation - complete all phases immediately
    const success = Math.random() < strategy.successRate;
    const deflection = success ? (Math.random() * 50 + 50) : (Math.random() * 30);
    
    // Set all phases complete
    setCurrentPhase(phases.length - 1);
    setPhaseProgress(100);
    setDeflectionProgress(deflection);
    setMissionSuccess(success);
    
    // Only show key updates in log
    addLog(success ? 'MISSION SUCCESS: Deflection confirmed' : 'PARTIAL SUCCESS: Monitoring required');
    addLog(`Trajectory altered by ${deflection.toFixed(2)}%`);
    
    setIsRunning(false);
    
    // Trigger completion effect
    setShowCompletionEffect(true);
    setTimeout(() => {
      setShowCompletionEffect(false);
      onComplete(success, deflection);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background dot-grid relative overflow-hidden">
      {/* Completion Flash Effect */}
      {showCompletionEffect && (
        <>
          {/* Screen flash overlay */}
          <div 
            className={`fixed inset-0 z-50 pointer-events-none animate-[flash_0.8s_ease-out_forwards] ${
              missionSuccess ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{
              animation: 'flash 0.8s ease-out forwards'
            }}
          />
          
          {/* Radial pulse rings */}
          <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div 
              className={`absolute w-24 h-24 rounded-full border-4 ${
                missionSuccess ? 'border-green-400' : 'border-amber-400'
              }`}
              style={{
                animation: 'pulseRing 1s ease-out forwards'
              }}
            />
            <div 
              className={`absolute w-24 h-24 rounded-full border-4 ${
                missionSuccess ? 'border-green-400' : 'border-amber-400'
              }`}
              style={{
                animation: 'pulseRing 1s ease-out 0.2s forwards'
              }}
            />
            <div 
              className={`absolute w-24 h-24 rounded-full border-4 ${
                missionSuccess ? 'border-green-400' : 'border-amber-400'
              }`}
              style={{
                animation: 'pulseRing 1s ease-out 0.4s forwards'
              }}
            />
          </div>

          {/* Success/Partial text burst */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div 
              className={`font-display text-4xl md:text-6xl font-bold tracking-wider ${
                missionSuccess ? 'text-green-400' : 'text-amber-400'
              }`}
              style={{
                animation: 'textBurst 1.2s ease-out forwards',
                textShadow: missionSuccess 
                  ? '0 0 20px rgba(74, 222, 128, 0.8), 0 0 40px rgba(74, 222, 128, 0.5)' 
                  : '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.5)'
              }}
            >
              {missionSuccess ? 'SUCCESS' : 'PARTIAL'}
            </div>
          </div>
        </>
      )}

      {/* Inline styles for animations */}
      <style>{`
        @keyframes flash {
          0% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(15); opacity: 0; }
        }
        @keyframes textBurst {
          0% { transform: scale(0.5); opacity: 0; }
          30% { transform: scale(1.2); opacity: 1; }
          70% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="artifact-panel p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="data-label mb-1">Active Mission</p>
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
          {/* Mission Timeline */}
          <div className="lg:col-span-2">
            <div className="artifact-panel p-6">
              <h2 className="font-display text-lg text-foreground mb-6">
                Mission Timeline
              </h2>
              
              {/* Phase Progress */}
              <div className="space-y-4 mb-8">
                {phases.map((phase, index) => {
                  const isActive = index === currentPhase;
                  const isComplete = index < currentPhase;
                  const isFuture = index > currentPhase;
                  
                  return (
                    <div 
                      key={phase.id}
                      className={`p-4 border transition-all ${
                        isActive ? 'border-foreground bg-accent/30' :
                        isComplete ? 'border-border bg-accent/10' :
                        'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`status-dot ${
                            isActive ? 'bg-foreground status-dot-pulse' :
                            isComplete ? 'bg-foreground' :
                            'bg-border'
                          }`} />
                          <span className="font-display text-base text-foreground">
                            {phase.name}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {phase.duration}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 ml-5">
                        {phase.description}
                      </p>
                      {isActive && (
                        <div className="progress-artifact ml-5">
                          <div 
                            className="progress-artifact-fill"
                            style={{ width: `${phaseProgress}%` }}
                          />
                        </div>
                      )}
                      {isComplete && (
                        <div className="text-xs text-muted-foreground font-mono ml-5">
                          ✓ Complete
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Start Button */}
              {!isRunning && currentPhase === 0 && phaseProgress === 0 && (
                <button
                  onClick={startSimulation}
                  className="btn-artifact-primary w-full py-4"
                >
                  Begin Simulation →
                </button>
              )}
              
              {!isRunning && currentPhase === 0 && phaseProgress === 0 && (
                <button
                  onClick={onBack}
                  className="btn-artifact w-full py-3 mt-4"
                >
                  Change Strategy
                </button>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Deflection Meter */}
            <div className="artifact-panel p-4">
              <h3 className="font-display text-sm text-foreground mb-4">
                Trajectory Deflection
              </h3>
              <div className="relative h-40 border border-border bg-accent/10 overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-foreground transition-all duration-300"
                  style={{ height: `${Math.min(deflectionProgress, 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-3xl text-foreground mix-blend-difference">
                    {deflectionProgress.toFixed(1)}%
                  </span>
                </div>
                {/* Target line */}
                <div 
                  className="absolute left-0 right-0 h-px bg-foreground opacity-50"
                  style={{ bottom: '50%' }}
                />
                <span className="absolute right-2 text-[9px] text-muted-foreground" style={{ bottom: '48%' }}>
                  Target
                </span>
              </div>
            </div>

            {/* Mission Log */}
            <div className="artifact-panel p-4">
              <h3 className="font-display text-sm text-foreground mb-3">
                Mission Log
              </h3>
              <div className="h-60 overflow-y-auto border border-border p-3 font-mono text-[11px]">
                {logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`py-1 ${
                      log.includes('successful') ? 'text-foreground' :
                      log.includes('partial') ? 'warning-indicator' :
                      log.includes('Phase') ? 'text-foreground' :
                      'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                {isRunning && (
                  <div className="text-foreground animate-pulse">▌</div>
                )}
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
                      <div className={`status-dot bg-foreground ${isRunning ? 'status-dot-pulse' : ''}`} />
                      <span className="text-[10px] text-muted-foreground">Active</span>
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