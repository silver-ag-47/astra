import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Rocket, Target, Shield, Globe, AlertTriangle, Zap } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to A.S.T.R.A.",
    description: "The Asteroid Simulation & Threat Response Authority is your command center for planetary defense. Track near-Earth objects, assess threats, and deploy defensive strategies to protect our planet.",
    icon: <Globe className="w-12 h-12" />,
  },
  {
    id: 2,
    title: "Mission Control",
    description: "The Mission Control dashboard displays all tracked asteroids with their threat levels. The Torino Scale (0-10) indicates impact probability and damage potential. Red indicators mean immediate attention required.",
    icon: <Target className="w-12 h-12" />,
    highlight: "dashboard",
  },
  {
    id: 3,
    title: "Threat Assessment",
    description: "Click on any asteroid to view detailed threat analysis including size, velocity, composition, and impact probability. The orbital visualization shows real-time trajectory data.",
    icon: <AlertTriangle className="w-12 h-12" />,
  },
  {
    id: 4,
    title: "Defense Systems",
    description: "Access our arsenal of planetary defense strategies: Kinetic Impactors for direct deflection, Gravity Tractors for gradual course correction, Nuclear Options for emergency scenarios, and Ion Beam Deflection for precision adjustments.",
    icon: <Shield className="w-12 h-12" />,
    highlight: "strategies",
  },
  {
    id: 5,
    title: "Mission Simulation",
    description: "Before deploying any defense strategy, run detailed simulations. Watch the mission unfold in real-time with spacecraft trajectories, impact predictions, and success probability calculations.",
    icon: <Rocket className="w-12 h-12" />,
  },
  {
    id: 6,
    title: "Ready for Action",
    description: "You're now cleared for duty, Commander. Monitor incoming threats, analyze impact scenarios, and execute defense missions to safeguard Earth. The fate of humanity rests in your hands.",
    icon: <Zap className="w-12 h-12" />,
  },
];

const Tutorial = ({ onComplete, onSkip }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Tutorial Card */}
      <div 
        className={`relative w-full max-w-2xl mx-4 transition-all duration-500 transform ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Card glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-lg blur-lg opacity-50 animate-pulse" />
        
        <div className="relative bg-card border border-primary/30 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground tracking-wider">
                  BRIEFING {String(currentStep + 1).padStart(2, '0')}/{String(tutorialSteps.length).padStart(2, '0')}
                </span>
              </div>
              <button
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="flex flex-col items-center text-center">
              {/* Icon with glow */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-4 rounded-full bg-primary/10 border border-primary/30 text-primary">
                  {step.icon}
                </div>
              </div>

              {/* Step indicator dots */}
              <div className="flex gap-2 mb-6">
                {tutorialSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-primary w-6' 
                        : index < currentStep 
                          ? 'bg-primary/50' 
                          : 'bg-muted/50'
                    }`}
                  />
                ))}
              </div>

              {/* Title */}
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4 tracking-wide">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed max-w-lg">
                {step.description}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/50 bg-muted/5">
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip Tutorial
              </button>
              
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-border/50 rounded hover:bg-muted/20 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-6 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium"
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      Begin Mission
                      <Rocket className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary/50 -translate-x-2 -translate-y-2" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary/50 translate-x-2 -translate-y-2" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary/50 -translate-x-2 translate-y-2" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary/50 translate-x-2 translate-y-2" />
      </div>
    </div>
  );
};

export default Tutorial;
