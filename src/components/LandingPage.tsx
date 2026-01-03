import { useEffect, useState } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage = ({ onEnter }: LandingPageProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      
      {/* Concentric Circles - Blueprint Style */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i}
            className="absolute inset-0 border border-border"
            style={{
              transform: `scale(${i * 0.2})`,
              borderRadius: '50%',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Status Tag */}
        <div className="tag mb-8">
          Simulation Active
        </div>

        {/* Main Title */}
        <div className="text-center mb-16 max-w-3xl">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.1]">
            Unified Asteroid<br />Defense Command
          </h1>
          
          <p className="font-mono text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Protecting humanity from extinction-level events through 
            international cooperation and advanced planetary defense systems.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-px bg-border mb-16 max-w-md w-full border border-border">
          {[
            { value: '6', label: 'Active Threats' },
            { value: '5', label: 'Partner Agencies' },
            { value: '4', label: 'Defense Systems' },
          ].map((stat, i) => (
            <div key={i} className="bg-background p-6 text-center">
              <p className="font-display text-3xl text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          className="btn-artifact-primary px-8 py-3"
        >
          Enter Command Center →
        </button>

        {/* Footer Info */}
        <div className="absolute bottom-4 left-6 text-left">
          <p className="text-[10px] text-muted-foreground tracking-wider mb-3">
            Hackathon Project · Planetary Defense Initiative
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground font-mono">
            <span>NASA</span>
            <span className="text-border">·</span>
            <span>ESA</span>
            <span className="text-border">·</span>
            <span>JAXA</span>
            <span className="text-border">·</span>
            <span>ISRO</span>
            <span className="text-border">·</span>
            <span>Roscosmos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;