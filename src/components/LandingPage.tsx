import { useEffect, useState } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage = ({ onEnter }: LandingPageProps) => {
  const [glitchText, setGlitchText] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Flash in effect
    setTimeout(() => setShowContent(true), 300);
    
    // Random glitch effect
    const glitchInterval = setInterval(() => {
      setGlitchText(true);
      setTimeout(() => setGlitchText(false), 100);
    }, 3000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute inset-0 diagonal-stripes" />
      
      {/* Radar Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="absolute inset-0 border-2 border-primary rounded-full"
            style={{
              transform: `scale(${i * 0.25})`,
              opacity: 1 - (i * 0.2),
            }}
          />
        ))}
        <div className="absolute inset-0 radar-sweep" />
      </div>

      {/* Content */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-6 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {/* Warning Banner */}
        <div className="emergency-alert mb-8 max-w-2xl animate-pulse-glow">
          <p className="font-mono text-sm text-center text-primary tracking-widest">
            ▲ PLANETARY DEFENSE SIMULATION ACTIVE ▲
          </p>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[3px] w-20 bg-primary" />
            <div className="hexagon w-16 h-16 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display text-3xl">U</span>
            </div>
            <div className="h-[3px] w-20 bg-primary" />
          </div>
          
          <h1 className={`font-display text-5xl md:text-7xl lg:text-8xl tracking-[0.15em] text-foreground mb-4 ${glitchText ? 'glitch-text' : ''}`}>
            UNIFIED ASTEROID
          </h1>
          <h1 className={`font-display text-5xl md:text-7xl lg:text-8xl tracking-[0.15em] text-primary mb-6 ${glitchText ? 'glitch-text' : ''}`}>
            DEFENSE COMMAND
          </h1>
          
          <p className="font-serif text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Protecting humanity from extinction-level events through 
            <span className="text-accent"> international cooperation</span> and 
            <span className="text-terminal"> advanced planetary defense</span>.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mb-12 max-w-3xl w-full">
          {[
            { value: '6', label: 'ACTIVE THREATS', color: 'text-primary' },
            { value: '5', label: 'PARTNER AGENCIES', color: 'text-accent' },
            { value: '4', label: 'DEFENSE SYSTEMS', color: 'text-terminal' },
          ].map((stat, i) => (
            <div key={i} className="brutalist-panel p-4 text-center">
              <p className={`font-display text-4xl md:text-5xl ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          className="btn-brutal-primary px-12 py-6 group relative overflow-hidden"
        >
          <span className="relative z-10 font-display text-2xl tracking-widest">
            ENTER COMMAND CENTER
          </span>
          <div className="absolute inset-0 bg-foreground transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-[10px] text-muted-foreground tracking-[0.3em] mb-2">
            HACKATHON PROJECT • PLANETARY DEFENSE INITIATIVE
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span>NASA</span>
            <span className="status-diamond bg-muted-foreground" />
            <span>ESA</span>
            <span className="status-diamond bg-muted-foreground" />
            <span>JAXA</span>
            <span className="status-diamond bg-muted-foreground" />
            <span>ISRO</span>
            <span className="status-diamond bg-muted-foreground" />
            <span>ROSCOSMOS</span>
          </div>
        </div>
      </div>

      {/* Corner Markers */}
      {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-8 h-8 border-2 border-primary`}>
          <div className={`absolute ${i < 2 ? 'top-0' : 'bottom-0'} ${i % 2 === 0 ? 'left-0' : 'right-0'} w-2 h-2 bg-primary`} />
        </div>
      ))}
    </div>
  );
};

export default LandingPage;
