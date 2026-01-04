import { Shield, Target, Rocket, AlertTriangle, CheckCircle, XCircle, Volume2, VolumeX } from 'lucide-react';

export type MissionPhase = 'approach' | 'launch' | 'intercept' | 'outcome';
export type MissionOutcome = 'pending' | 'success' | 'failure';

interface MissionHUDProps {
  phase: MissionPhase;
  outcome: MissionOutcome;
  asteroidName: string;
  strategyName: string;
  strategyType: string;
  distanceToEarth: number;
  distanceToTarget: number;
  timeRemaining: number;
  successProbability: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const MissionHUD = ({
  phase,
  outcome,
  asteroidName,
  strategyName,
  strategyType,
  distanceToEarth,
  distanceToTarget,
  timeRemaining,
  successProbability,
  isMuted = false,
  onToggleMute
}: MissionHUDProps) => {
  const getPhaseLabel = () => {
    switch (phase) {
      case 'approach': return 'THREAT APPROACH';
      case 'launch': return 'DEFENSE LAUNCH';
      case 'intercept': return 'INTERCEPTING';
      case 'outcome': return outcome === 'success' ? 'MISSION SUCCESS' : 'MISSION FAILED';
    }
  };

  const getPhaseColor = () => {
    if (outcome === 'success') return 'text-green-400';
    if (outcome === 'failure') return 'text-red-400';
    switch (phase) {
      case 'approach': return 'text-red-400';
      case 'launch': return 'text-cyan-400';
      case 'intercept': return 'text-yellow-400';
      default: return 'text-cyan-400';
    }
  };

  const getStrategyIcon = () => {
    switch (strategyType) {
      case 'DART': return '🚀';
      case 'GRAV': return '🛰️';
      case 'NUKE': return '☢️';
      case 'LASR': return '🔫';
      default: return '🎯';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex justify-between items-start">
          {/* Mission phase */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${getPhaseColor()}`}>
              {outcome === 'success' ? <CheckCircle className="w-5 h-5" /> : 
               outcome === 'failure' ? <XCircle className="w-5 h-5" /> :
               <Target className="w-5 h-5 animate-pulse" />}
              <span className="font-mono text-lg tracking-wider">{getPhaseLabel()}</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-mono">TIME TO IMPACT</div>
            <div className={`font-mono text-2xl ${timeRemaining < 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
              T-{Math.max(0, timeRemaining).toFixed(1)}s
            </div>
          </div>

          {/* Success probability + Sound toggle */}
          <div className="flex items-start gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-mono">SUCCESS PROBABILITY</div>
              <div className={`font-mono text-xl ${successProbability > 70 ? 'text-green-400' : successProbability > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {successProbability.toFixed(0)}%
              </div>
            </div>
            
            {/* Sound toggle button */}
            {onToggleMute && (
              <button
                onClick={onToggleMute}
                className="pointer-events-auto p-2 bg-black/60 backdrop-blur-sm border border-border rounded-lg hover:bg-black/80 transition-colors"
                title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Left panel - Target info */}
      <div className="absolute left-4 top-24 bg-black/60 backdrop-blur-sm border border-red-500/30 rounded-lg p-3 w-56">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-xs font-mono text-red-400">TARGET</span>
        </div>
        <div className="text-sm font-bold text-foreground mb-2">{asteroidName}</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Distance to Earth:</span>
            <span className={`font-mono ${distanceToEarth < 1 ? 'text-red-400' : 'text-foreground'}`}>
              {distanceToEarth.toFixed(2)} AU
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, 100 - distanceToEarth * 20)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right panel - Defense info */}
      <div className="absolute right-4 top-24 bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 w-56">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400">DEFENSE SYSTEM</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{getStrategyIcon()}</span>
          <span className="text-sm font-bold text-foreground">{strategyName}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Distance to Target:</span>
            <span className="font-mono text-cyan-400">{distanceToTarget.toFixed(2)} AU</span>
          </div>
          {phase !== 'approach' && (
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div 
                className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (1 - distanceToTarget / 5) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom phase indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
          {['approach', 'launch', 'intercept', 'outcome'].map((p, i) => (
            <div key={p} className="flex items-center">
              <div className={`w-3 h-3 rounded-full transition-colors ${
                phase === p ? 
                  (outcome === 'success' && p === 'outcome' ? 'bg-green-400' : 
                   outcome === 'failure' && p === 'outcome' ? 'bg-red-400' : 
                   'bg-cyan-400 animate-pulse') : 
                  (['approach', 'launch', 'intercept', 'outcome'].indexOf(phase) > i ? 'bg-cyan-400/50' : 'bg-gray-600')
              }`} />
              {i < 3 && (
                <div className={`w-8 h-0.5 ${
                  ['approach', 'launch', 'intercept', 'outcome'].indexOf(phase) > i ? 'bg-cyan-400/50' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
          <span>APPROACH</span>
          <span>LAUNCH</span>
          <span>INTERCEPT</span>
          <span>OUTCOME</span>
        </div>
      </div>

      {/* Outcome overlay */}
      {outcome !== 'pending' && (
        <div className={`absolute inset-0 flex items-center justify-center ${outcome === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'} animate-fade-in`}>
          <div className={`text-center ${outcome === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            <div className="text-6xl mb-4">
              {outcome === 'success' ? <CheckCircle className="w-24 h-24 mx-auto" /> : <XCircle className="w-24 h-24 mx-auto" />}
            </div>
            <div className="text-3xl font-bold tracking-wider">
              {outcome === 'success' ? 'ASTEROID DEFLECTED' : 'DEFLECTION FAILED'}
            </div>
            <div className="text-lg mt-2 text-muted-foreground">
              {outcome === 'success' ? 'Earth is safe' : 'Preparing impact assessment...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
