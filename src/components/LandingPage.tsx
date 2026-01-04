import { useEffect, useState, useMemo } from 'react';
import ThemeToggle from './ThemeToggle';
import { BookOpen, Rocket, GraduationCap, Globe, ChevronDown, ChevronUp, Atom, Calculator, Palette } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

// Generate random particles
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
  }));
};

const steamTopics = [
  { icon: Atom, label: 'Science', desc: 'Astronomy, physics, orbital mechanics', color: 'text-accent-cyan' },
  { icon: Rocket, label: 'Technology', desc: 'Spacecraft systems, defense tech', color: 'text-accent-green' },
  { icon: Calculator, label: 'Engineering', desc: 'Mission design, trajectory planning', color: 'text-accent-amber' },
  { icon: Palette, label: 'Arts', desc: '3D visualization, UI/UX design', color: 'text-accent-red' },
  { icon: GraduationCap, label: 'Mathematics', desc: 'Orbital calculations, probability', color: 'text-accent-cyan' },
];

const LandingPage = ({ onEnter }: LandingPageProps) => {
  const [showContent, setShowContent] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const particles = useMemo(() => generateParticles(40), []);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-accent-cyan animate-float-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* Concentric Circles - Blueprint Style with Radar Sweep */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
        {/* Concentric circles */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i}
            className="absolute inset-0 border border-border opacity-30"
            style={{
              transform: `scale(${i * 0.2})`,
              borderRadius: '50%',
            }}
          />
        ))}
        
        {/* Radar sweep effect */}
        <div className="absolute inset-0 animate-radar-sweep">
          <div 
            className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--accent-cyan)) 0%, transparent 100%)',
              boxShadow: '0 0 20px hsl(var(--accent-cyan) / 0.5)',
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 w-1/2 h-full origin-left -translate-y-1/2"
            style={{
              background: 'conic-gradient(from -90deg, transparent 0deg, hsl(var(--accent-cyan) / 0.15) 30deg, transparent 60deg)',
              clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
            }}
          />
        </div>
        
        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden rounded-full opacity-20">
          <div className="absolute inset-0 animate-scan-lines" 
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--accent-green) / 0.3) 2px, hsl(var(--accent-green) / 0.3) 4px)',
              backgroundSize: '100% 8px',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* About Section - Collapsible */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-20">
          <button
            onClick={() => setAboutExpanded(!aboutExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-background/80 backdrop-blur-sm border border-border hover:border-accent-cyan/50 transition-colors font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="w-3 h-3" />
            About A.S.T.R.A. - STEAM Educational Project
            {aboutExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          <div className={`overflow-hidden transition-all duration-500 ${aboutExpanded ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="bg-background/90 backdrop-blur-sm border border-border p-6 space-y-6">
              
              {/* Project Overview */}
              <div className="text-center border-b border-border pb-4">
                <h3 className="font-display text-lg text-foreground mb-2 flex items-center justify-center gap-2">
                  <Globe className="w-4 h-4 text-accent-cyan" />
                  Project Overview
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  A.S.T.R.A. (Asteroid Simulation & Threat Response Authority) is an interactive educational simulation 
                  that demonstrates real-world planetary defense concepts. Inspired by NASA's DART mission and international 
                  space agencies' efforts to protect Earth from asteroid impacts.
                </p>
              </div>

              {/* STEAM Education Grid */}
              <div>
                <h4 className="font-mono text-xs text-accent-green tracking-wider mb-3 text-center">STEAM LEARNING OBJECTIVES</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {steamTopics.map((topic) => (
                    <div key={topic.label} className="bg-muted/30 border border-border p-3 text-center hover:border-accent-cyan/30 transition-colors">
                      <topic.icon className={`w-4 h-4 mx-auto mb-1 ${topic.color}`} />
                      <p className={`text-[10px] font-mono ${topic.color} mb-0.5`}>{topic.label}</p>
                      <p className="text-[9px] text-muted-foreground">{topic.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why It Matters */}
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="bg-muted/20 border border-accent-amber/30 p-4">
                  <h5 className="font-mono text-accent-amber mb-2 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" />
                    For Students
                  </h5>
                  <ul className="text-muted-foreground space-y-1 text-[10px]">
                    <li>• Hands-on learning with real space science concepts</li>
                    <li>• Understanding of NASA's actual planetary defense methods</li>
                    <li>• Development of critical thinking and problem-solving skills</li>
                    <li>• Engagement with interactive 3D simulations</li>
                  </ul>
                </div>
                <div className="bg-muted/20 border border-accent-cyan/30 p-4">
                  <h5 className="font-mono text-accent-cyan mb-2 flex items-center gap-2">
                    <Rocket className="w-3 h-3" />
                    Why It Matters
                  </h5>
                  <ul className="text-muted-foreground space-y-1 text-[10px]">
                    <li>• Asteroid impacts are real threats to humanity's future</li>
                    <li>• International cooperation is essential for planetary defense</li>
                    <li>• Understanding space science inspires next-gen scientists</li>
                    <li>• Makes complex astrophysics accessible and engaging</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tag */}
        <div className="tag mb-8 border-accent-green text-accent-green">
          <span className="w-2 h-2 bg-accent-green rounded-full mr-2 animate-pulse-subtle"></span>
          Simulation Active
        </div>

        {/* Main Title */}
        <div className="text-center mb-16 max-w-3xl">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[1.1]">
            A.S.T.R.A.
          </h1>
          <p className="font-mono text-xs text-accent-cyan tracking-widest mb-4">
            Asteroid Simulation & Threat Response Authority
          </p>
          
          <p className="font-mono text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Protecting humanity from extinction-level events through 
            international cooperation and advanced planetary defense systems.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-px bg-border mb-16 max-w-md w-full border border-border">
          {[
            { value: '6', label: 'Active Threats', color: 'text-accent-red' },
            { value: '5', label: 'Partner Agencies', color: 'text-accent-cyan' },
            { value: '4', label: 'Defense Systems', color: 'text-accent-green' },
          ].map((stat, i) => (
            <div key={i} className="bg-background p-6 text-center">
              <p className={`font-display text-3xl ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-1 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          className="bg-accent-amber text-background px-8 py-3 font-mono text-xs tracking-wide border border-accent-amber hover:opacity-90 transition-opacity"
        >
          Enter Command Center →
        </button>

        {/* Footer Info */}
        <div className="absolute bottom-4 left-6 text-left">
          <p className="text-[10px] text-muted-foreground tracking-wider mb-3">
            Hackathon Project · Planetary Defense Initiative
          </p>
          <div className="flex items-center gap-4 text-[10px] font-mono mb-3">
            <span className="text-accent-cyan">NASA</span>
            <span className="text-border">·</span>
            <span className="text-accent-green">ESA</span>
            <span className="text-border">·</span>
            <span className="text-accent-red">JAXA</span>
            <span className="text-border">·</span>
            <span className="text-accent-amber">ISRO</span>
            <span className="text-border">·</span>
            <span className="text-accent-cyan">Roscosmos</span>
          </div>
          <button
            onClick={onEnter}
            className="text-[10px] font-mono text-accent-green border border-accent-green/50 px-3 py-1.5 hover:bg-accent-green/10 transition-colors"
          >
            Initiate Mission →
          </button>
        </div>

        {/* Made with love credit */}
        <div className="absolute bottom-4 right-6 flex items-center gap-4">
          <a
            href="https://discord.gg/rbecJstsS4"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-muted-foreground hover:text-accent-cyan transition-colors"
          >
            Made with <span className="text-accent-red">❤️</span> by Silver and Team ASTRA INFINITY
          </a>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;