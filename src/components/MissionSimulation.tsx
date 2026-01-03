import { useState, useEffect } from 'react';
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

  const phases = getMissionPhases();

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const startSimulation = () => {
    setIsRunning(true);
    setCurrentPhase(0);
    setPhaseProgress(0);
    setLogs([]);
    setDeflectionProgress(0);
    addLog('MISSION SIMULATION INITIATED');
    addLog(`Target: ${asteroid.name} (${asteroid.designation})`);
    addLog(`Defense Strategy: ${strategy.name}`);
  };

  useEffect(() => {
    if (!isRunning) return;

    const progressInterval = setInterval(() => {
      setPhaseProgress(prev => {
        if (prev >= 100) {
          if (currentPhase < phases.length - 1) {
            setCurrentPhase(curr => curr + 1);
            const phase = phases[currentPhase + 1];
            addLog(`PHASE ${currentPhase + 2}: ${phase.name} - ${phase.description}`);
            
            // Add random agency logs
            const agency = spaceAgencies[Math.floor(Math.random() * spaceAgencies.length)];
            setTimeout(() => addLog(`${agency.code} confirms systems nominal`), 500);
            
            return 0;
          } else {
            // Simulation complete
            setIsRunning(false);
            const success = Math.random() < strategy.successRate;
            const deflection = success ? (Math.random() * 50 + 50) : (Math.random() * 30);
            setDeflectionProgress(deflection);
            addLog(success ? 'DEFLECTION SUCCESSFUL' : 'DEFLECTION PARTIAL - MONITORING REQUIRED');
            addLog(`Trajectory altered by ${deflection.toFixed(2)}%`);
            setTimeout(() => onComplete(success, deflection), 2000);
            return 100;
          }
        }
        
        // Increase deflection progress during final phase
        if (currentPhase === phases.length - 1) {
          setDeflectionProgress(prev + 2);
        }
        
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isRunning, currentPhase, phases, strategy, asteroid, onComplete]);

  useEffect(() => {
    if (currentPhase === 0 && phaseProgress === 0 && isRunning) {
      addLog(`PHASE 1: ${phases[0].name} - ${phases[0].description}`);
    }
  }, [isRunning, currentPhase, phaseProgress, phases]);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="brutalist-panel p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-primary tracking-widest mb-1">▲ ACTIVE MISSION ▲</p>
              <h1 className="font-display text-3xl text-foreground tracking-wide">
                OPERATION: {asteroid.name.toUpperCase()} INTERCEPT
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground tracking-widest">DEFENSE PROTOCOL</p>
              <p className="font-display text-xl text-primary">{strategy.code}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mission Timeline */}
          <div className="lg:col-span-2">
            <div className="brutalist-panel p-6">
              <h2 className="font-display text-lg tracking-widest text-foreground mb-6">
                MISSION TIMELINE
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
                      className={`p-4 border-2 transition-all ${
                        isActive ? 'border-primary bg-primary/10' :
                        isComplete ? 'border-terminal bg-terminal/10' :
                        'border-border bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`status-diamond ${
                            isActive ? 'bg-primary animate-blink' :
                            isComplete ? 'bg-terminal' :
                            'bg-muted-foreground'
                          }`} />
                          <span className="font-display text-lg tracking-wide text-foreground">
                            {phase.name}
                          </span>
                        </div>
                        <span className="font-mono text-sm text-muted-foreground">
                          {phase.duration}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-serif mb-2">
                        {phase.description}
                      </p>
                      {isActive && (
                        <div className="progress-brutal">
                          <div 
                            className="progress-brutal-fill bg-primary"
                            style={{ width: `${phaseProgress}%` }}
                          />
                        </div>
                      )}
                      {isComplete && (
                        <div className="text-xs text-terminal font-mono">
                          ✓ PHASE COMPLETE
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
                  className="btn-brutal-primary w-full py-4"
                >
                  <span className="text-xl">▶ BEGIN SIMULATION</span>
                </button>
              )}
              
              {!isRunning && currentPhase === 0 && phaseProgress === 0 && (
                <button
                  onClick={onBack}
                  className="btn-brutal w-full py-3 mt-4"
                >
                  CHANGE STRATEGY
                </button>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Deflection Meter */}
            <div className="brutalist-panel-red p-4">
              <h3 className="font-display text-sm tracking-widest text-foreground mb-4">
                TRAJECTORY DEFLECTION
              </h3>
              <div className="relative h-40 border-2 border-border bg-muted overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-terminal transition-all duration-300"
                  style={{ height: `${Math.min(deflectionProgress, 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-3xl text-foreground drop-shadow-lg">
                    {deflectionProgress.toFixed(1)}%
                  </span>
                </div>
                {/* Target line */}
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-primary"
                  style={{ bottom: '50%' }}
                />
                <span className="absolute right-2 text-[9px] text-primary" style={{ bottom: '48%' }}>
                  TARGET
                </span>
              </div>
            </div>

            {/* Mission Log */}
            <div className="brutalist-panel p-4">
              <h3 className="font-display text-sm tracking-widest text-foreground mb-3">
                MISSION LOG
              </h3>
              <div className="h-60 overflow-y-auto bg-background border-2 border-border p-2 font-mono text-xs">
                {logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`py-1 ${
                      log.includes('SUCCESSFUL') ? 'text-terminal' :
                      log.includes('PARTIAL') ? 'text-accent' :
                      log.includes('PHASE') ? 'text-primary' :
                      'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                {isRunning && (
                  <div className="text-primary animate-blink">▌</div>
                )}
              </div>
            </div>

            {/* Agency Status */}
            <div className="brutalist-panel p-4">
              <h3 className="font-display text-sm tracking-widest text-foreground mb-3">
                COALITION STATUS
              </h3>
              <div className="space-y-2">
                {spaceAgencies.slice(0, 3).map((agency) => (
                  <div key={agency.id} className="flex items-center justify-between">
                    <span className="font-mono text-xs text-foreground">{agency.code}</span>
                    <div className="flex items-center gap-2">
                      <div className={`status-diamond bg-terminal ${isRunning ? 'animate-blink' : ''}`} />
                      <span className="text-[10px] text-terminal">ACTIVE</span>
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
