import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Lightbulb, Target, Rocket, Crosshair, Trophy } from 'lucide-react';
import { MissionPhase } from './MissionHUD';

interface TutorialStep {
  phase: MissionPhase;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlightSelector?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  tip?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    phase: 'approach',
    title: 'Threat Approach Phase',
    description: 'The asteroid is approaching Earth. Watch the red trajectory line showing its collision course. The left panel displays real-time distance data.',
    icon: <Target className="w-6 h-6" />,
    position: 'top-left',
    tip: 'Keep an eye on the "Distance to Earth" indicator - when it drops below 1 AU, the situation becomes critical!'
  },
  {
    phase: 'launch',
    title: 'Defense Launch Phase',
    description: 'Your spacecraft has been deployed! The right panel tracks your defense system as it approaches the target. Each strategy has unique visual effects.',
    icon: <Rocket className="w-6 h-6" />,
    position: 'top-right',
    tip: 'Different strategies create different effects: lasers show a beam, gravity tractors display a force field, and nuclear options have a distinct exhaust trail.'
  },
  {
    phase: 'intercept',
    title: 'Interception Phase',
    description: 'The spacecraft is now maneuvering to intercept the asteroid. Success probability is calculated based on asteroid size, velocity, and your chosen strategy.',
    icon: <Crosshair className="w-6 h-6" />,
    position: 'bottom-right',
    tip: 'Watch the bottom phase indicator to track mission progress. The countdown timer shows remaining time before potential impact.'
  },
  {
    phase: 'outcome',
    title: 'Mission Outcome',
    description: 'The interception attempt has been made. If successful, the asteroid trajectory will change to green. If failed, you\'ll see an impact simulation.',
    icon: <Trophy className="w-6 h-6" />,
    position: 'center',
    tip: 'A successful deflection means Earth is safe! A failure triggers the impact simulation showing potential damage assessment.'
  }
];

interface SimulationTutorialProps {
  currentPhase: MissionPhase;
  isFirstTime: boolean;
  onDismiss: () => void;
  onNeverShowAgain: () => void;
}

export const SimulationTutorial = ({ 
  currentPhase, 
  isFirstTime, 
  onDismiss,
  onNeverShowAgain 
}: SimulationTutorialProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasSeenPhases, setHasSeenPhases] = useState<Set<MissionPhase>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);

  const currentStep = tutorialSteps.find(step => step.phase === currentPhase);
  
  // Update when phase changes
  useEffect(() => {
    if (currentStep && !hasSeenPhases.has(currentPhase)) {
      setIsMinimized(false);
      setHasSeenPhases(prev => new Set([...prev, currentPhase]));
    }
  }, [currentPhase, currentStep, hasSeenPhases]);

  if (!isVisible || !isFirstTime || !currentStep) return null;

  const getPositionClasses = (position: TutorialStep['position']) => {
    switch (position) {
      case 'top-left':
        return 'top-36 left-64';
      case 'top-right':
        return 'top-36 right-64';
      case 'bottom-left':
        return 'bottom-24 left-8';
      case 'bottom-right':
        return 'bottom-24 right-8';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onDismiss();
  };

  const handleNeverShow = () => {
    setIsVisible(false);
    onNeverShowAgain();
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 left-8 z-50 pointer-events-auto bg-primary/90 backdrop-blur-sm 
                   rounded-full p-3 border border-primary/50 shadow-lg shadow-primary/20
                   hover:bg-primary transition-all duration-300 animate-pulse"
        title="Show tutorial"
      >
        <Lightbulb className="w-5 h-5 text-primary-foreground" />
      </button>
    );
  }

  return (
    <>
      {/* Highlight overlay for specific UI elements */}
      <div className="fixed inset-0 z-30 pointer-events-none">
        {currentPhase === 'approach' && (
          <div className="absolute left-4 top-24 w-60 h-28 border-2 border-primary rounded-lg animate-pulse shadow-lg shadow-primary/30" />
        )}
        {currentPhase === 'launch' && (
          <div className="absolute right-4 top-24 w-60 h-28 border-2 border-cyan-400 rounded-lg animate-pulse shadow-lg shadow-cyan-400/30" />
        )}
        {currentPhase === 'intercept' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 h-16 border-2 border-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/30" />
        )}
      </div>

      {/* Tutorial tooltip */}
      <div 
        className={`fixed ${getPositionClasses(currentStep.position)} z-50 pointer-events-auto max-w-sm animate-fade-in`}
      >
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                {currentStep.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Phase {tutorialSteps.findIndex(s => s.phase === currentPhase) + 1} of {tutorialSteps.length}
                </p>
                <h3 className="font-display text-foreground text-lg">
                  {currentStep.title}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                title="Minimize"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-destructive/20 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                title="Close tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>

            {currentStep.tip && (
              <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-relaxed">
                  <span className="font-semibold text-primary">Pro Tip:</span> {currentStep.tip}
                </p>
              </div>
            )}

            {/* Phase progress dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {tutorialSteps.map((step, index) => (
                <div
                  key={step.phase}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step.phase === currentPhase
                      ? 'w-6 bg-primary'
                      : hasSeenPhases.has(step.phase)
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
            <button
              onClick={handleNeverShow}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Don't show again
            </button>
            <button
              onClick={handleClose}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Got it <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pointer arrow */}
        {currentStep.position !== 'center' && (
          <div 
            className={`absolute w-4 h-4 bg-card border-l border-t border-border rotate-45
              ${currentStep.position.includes('left') ? '-left-2 top-12' : ''}
              ${currentStep.position.includes('right') ? '-right-2 top-12' : ''}
            `}
          />
        )}
      </div>
    </>
  );
};

export default SimulationTutorial;
