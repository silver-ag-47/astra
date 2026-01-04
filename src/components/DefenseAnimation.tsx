import { useEffect, useState } from 'react';
import { useDefenseSounds } from '@/hooks/useDefenseSounds';
import { Volume2, VolumeX } from 'lucide-react';

interface DefenseAnimationProps {
  strategyCode: string;
}

const DefenseAnimation = ({ strategyCode }: DefenseAnimationProps) => {
  const [frame, setFrame] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playKineticImpactor, playGravityTractor, playNuclearDeflection, playIonBeam, stopSound } = useDefenseSounds();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Handle sound based on strategy
  useEffect(() => {
    if (!soundEnabled) {
      stopSound();
      return;
    }

    switch (strategyCode) {
      case 'DART':
        playKineticImpactor();
        break;
      case 'GRAV':
        playGravityTractor();
        break;
      case 'NUKE':
        playNuclearDeflection();
        break;
      case 'ION':
        playIonBeam();
        break;
    }

    return () => {
      stopSound();
    };
  }, [soundEnabled, strategyCode, playKineticImpactor, playGravityTractor, playNuclearDeflection, playIonBeam, stopSound]);

  // Stop sound when component unmounts
  useEffect(() => {
    return () => {
      stopSound();
    };
  }, [stopSound]);

  const renderKineticImpactor = () => {
    const impactFrame = 60;
    const hasImpacted = frame >= impactFrame;
    const spacecraftX = hasImpacted ? 75 : 20 + (frame / impactFrame) * 55;
    
    return (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Background stars */}
        {[...Array(15)].map((_, i) => (
          <circle
            key={i}
            cx={(i * 37 + 10) % 200}
            cy={(i * 23 + 5) % 100}
            r={0.5 + (i % 3) * 0.3}
            fill="white"
            opacity={0.3 + (i % 5) * 0.1}
          />
        ))}
        
        {/* Asteroid */}
        <ellipse
          cx={150}
          cy={50}
          rx={hasImpacted ? 18 + Math.sin(frame * 0.5) * 2 : 20}
          ry={hasImpacted ? 13 + Math.cos(frame * 0.5) * 2 : 15}
          fill="#6b5b4f"
          stroke="#8b7b6f"
          strokeWidth={1}
        />
        <ellipse cx={145} cy={45} rx={4} ry={3} fill="#5a4a3f" />
        <ellipse cx={155} cy={55} rx={3} ry={2} fill="#4a3a2f" />
        
        {/* Spacecraft / Impactor */}
        {!hasImpacted && (
          <g transform={`translate(${spacecraftX}, 50)`}>
            {/* Thruster trail */}
            <path
              d={`M -5,0 Q -15,${Math.sin(frame * 0.3) * 3} -25,0 Q -15,${-Math.sin(frame * 0.3) * 3} -5,0`}
              fill="none"
              stroke="#00ffff"
              strokeWidth={2}
              opacity={0.6}
            />
            <path
              d={`M -5,0 Q -10,${Math.sin(frame * 0.5) * 2} -18,0`}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1}
              opacity={0.8}
            />
            {/* Spacecraft body */}
            <polygon
              points="10,0 -5,-5 -5,5"
              fill="#888"
              stroke="#aaa"
              strokeWidth={0.5}
            />
            <rect x={-8} y={-8} width={3} height={16} fill="#4488ff" opacity={0.7} />
          </g>
        )}
        
        {/* Impact effects */}
        {hasImpacted && (
          <g>
            {/* Flash */}
            <circle
              cx={130}
              cy={50}
              r={5 + (frame - impactFrame) * 0.3}
              fill="#ffff00"
              opacity={Math.max(0, 1 - (frame - impactFrame) * 0.05)}
            />
            {/* Debris particles */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const dist = (frame - impactFrame) * 1.5;
              return (
                <circle
                  key={i}
                  cx={130 + Math.cos(angle) * dist}
                  cy={50 + Math.sin(angle) * dist}
                  r={1.5}
                  fill="#ff8844"
                  opacity={Math.max(0, 1 - (frame - impactFrame) * 0.03)}
                />
              );
            })}
            {/* Deflected trajectory */}
            <path
              d={`M 150,50 Q 170,${40 - (frame - impactFrame) * 0.3} 200,${30 - (frame - impactFrame) * 0.5}`}
              fill="none"
              stroke="#00ff00"
              strokeWidth={1.5}
              strokeDasharray="4,2"
              opacity={Math.min(1, (frame - impactFrame) * 0.1)}
            />
          </g>
        )}
        
        {/* Original trajectory */}
        <path
          d="M 0,50 L 130,50"
          fill="none"
          stroke="#ff4444"
          strokeWidth={1}
          strokeDasharray="3,3"
          opacity={0.5}
        />
        
        {/* Label */}
        <text x={100} y={95} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">
          {hasImpacted ? 'TRAJECTORY ALTERED' : 'KINETIC INTERCEPT'}
        </text>
      </svg>
    );
  };

  const renderGravityTractor = () => {
    const orbitAngle = (frame / 100) * Math.PI * 2;
    const hoverX = 100 + Math.cos(orbitAngle) * 35;
    const hoverY = 50 + Math.sin(orbitAngle) * 15;
    
    return (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Background stars */}
        {[...Array(15)].map((_, i) => (
          <circle
            key={i}
            cx={(i * 37 + 10) % 200}
            cy={(i * 23 + 5) % 100}
            r={0.5 + (i % 3) * 0.3}
            fill="white"
            opacity={0.3 + (i % 5) * 0.1}
          />
        ))}
        
        {/* Asteroid */}
        <ellipse
          cx={100}
          cy={50}
          rx={20}
          ry={15}
          fill="#6b5b4f"
          stroke="#8b7b6f"
          strokeWidth={1}
        />
        <ellipse cx={95} cy={45} rx={4} ry={3} fill="#5a4a3f" />
        
        {/* Gravitational field lines */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2 + frame * 0.02;
          return (
            <path
              key={i}
              d={`M ${100 + Math.cos(angle) * 25},${50 + Math.sin(angle) * 18} 
                  Q ${100 + Math.cos(angle) * 40},${50 + Math.sin(angle) * 30} 
                  ${hoverX},${hoverY}`}
              fill="none"
              stroke="#00ffff"
              strokeWidth={0.5}
              opacity={0.3 + Math.sin(frame * 0.1 + i) * 0.2}
              strokeDasharray="2,2"
            />
          );
        })}
        
        {/* Spacecraft orbiting */}
        <g transform={`translate(${hoverX}, ${hoverY})`}>
          {/* Ion thruster glow */}
          <ellipse
            cx={0}
            cy={8}
            rx={3}
            ry={5 + Math.sin(frame * 0.2) * 2}
            fill="#00ffff"
            opacity={0.4}
          />
          {/* Spacecraft body */}
          <rect x={-4} y={-3} width={8} height={6} fill="#666" stroke="#888" strokeWidth={0.5} />
          <rect x={-10} y={-1} width={6} height={2} fill="#4488ff" opacity={0.8} />
          <rect x={4} y={-1} width={6} height={2} fill="#4488ff" opacity={0.8} />
        </g>
        
        {/* Slow deflection arrow */}
        <path
          d="M 130,50 L 180,45"
          fill="none"
          stroke="#00ff00"
          strokeWidth={1.5}
          opacity={0.6}
          markerEnd="url(#arrowhead)"
        />
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#00ff00" opacity={0.6} />
          </marker>
        </defs>
        
        {/* Label */}
        <text x={100} y={95} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">
          GRAVITATIONAL TOW - {((frame / 100) * 360).toFixed(0)}°
        </text>
      </svg>
    );
  };

  const renderNuclearDeflection = () => {
    const detonationFrame = 50;
    const hasDetonated = frame >= detonationFrame;
    const missileX = hasDetonated ? 95 : 10 + (frame / detonationFrame) * 85;
    const blastRadius = hasDetonated ? Math.min(40, (frame - detonationFrame) * 2) : 0;
    
    return (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Background stars */}
        {[...Array(15)].map((_, i) => (
          <circle
            key={i}
            cx={(i * 37 + 10) % 200}
            cy={(i * 23 + 5) % 100}
            r={0.5 + (i % 3) * 0.3}
            fill="white"
            opacity={hasDetonated ? 0.1 : 0.3 + (i % 5) * 0.1}
          />
        ))}
        
        {/* Nuclear blast */}
        {hasDetonated && (
          <g>
            {/* Outer glow */}
            <circle
              cx={100}
              cy={50}
              r={blastRadius * 1.5}
              fill="none"
              stroke="#ff8800"
              strokeWidth={2}
              opacity={Math.max(0, 0.5 - (frame - detonationFrame) * 0.01)}
            />
            {/* Middle ring */}
            <circle
              cx={100}
              cy={50}
              r={blastRadius}
              fill={`rgba(255, 200, 0, ${Math.max(0, 0.6 - (frame - detonationFrame) * 0.015)})`}
            />
            {/* Core flash */}
            <circle
              cx={100}
              cy={50}
              r={blastRadius * 0.3}
              fill="#ffffff"
              opacity={Math.max(0, 1 - (frame - detonationFrame) * 0.05)}
            />
          </g>
        )}
        
        {/* Asteroid */}
        <ellipse
          cx={hasDetonated ? 100 + (frame - detonationFrame) * 0.8 : 100}
          cy={hasDetonated ? 50 - (frame - detonationFrame) * 0.4 : 50}
          rx={20}
          ry={15}
          fill="#6b5b4f"
          stroke="#8b7b6f"
          strokeWidth={1}
          opacity={hasDetonated ? Math.max(0.3, 1 - blastRadius * 0.01) : 1}
        />
        
        {/* Missile */}
        {!hasDetonated && (
          <g transform={`translate(${missileX}, 55)`}>
            {/* Exhaust */}
            <ellipse
              cx={-8}
              cy={0}
              rx={6 + Math.sin(frame * 0.5) * 2}
              ry={2}
              fill="#ff4400"
              opacity={0.7}
            />
            {/* Warhead */}
            <polygon points="8,-3 8,3 -5,2 -5,-2" fill="#444" stroke="#666" strokeWidth={0.5} />
            <circle cx={6} cy={0} r={2} fill="#ff0000" />
          </g>
        )}
        
        {/* Deflection path */}
        {hasDetonated && frame > detonationFrame + 10 && (
          <path
            d={`M 100,50 Q 150,30 200,20`}
            fill="none"
            stroke="#00ff00"
            strokeWidth={1.5}
            strokeDasharray="4,2"
            opacity={Math.min(1, (frame - detonationFrame - 10) * 0.05)}
          />
        )}
        
        {/* Label */}
        <text x={100} y={95} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">
          {hasDetonated ? 'STANDOFF DETONATION' : 'NUCLEAR APPROACH'}
        </text>
      </svg>
    );
  };

  const renderIonBeam = () => {
    const beamIntensity = 0.5 + Math.sin(frame * 0.1) * 0.3;
    
    return (
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Background stars */}
        {[...Array(15)].map((_, i) => (
          <circle
            key={i}
            cx={(i * 37 + 10) % 200}
            cy={(i * 23 + 5) % 100}
            r={0.5 + (i % 3) * 0.3}
            fill="white"
            opacity={0.3 + (i % 5) * 0.1}
          />
        ))}
        
        {/* Ion beam */}
        <defs>
          <linearGradient id="ionBeam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity={beamIntensity} />
            <stop offset="50%" stopColor="#8888ff" stopOpacity={beamIntensity * 0.7} />
            <stop offset="100%" stopColor="#00ffff" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        
        {/* Beam effect */}
        <polygon
          points="50,48 50,52 130,58 130,42"
          fill="url(#ionBeam)"
        />
        {/* Beam particles */}
        {[...Array(10)].map((_, i) => {
          const particleX = 50 + ((frame * 2 + i * 10) % 80);
          return (
            <circle
              key={i}
              cx={particleX}
              cy={50 + Math.sin(particleX * 0.1 + i) * 3}
              r={1}
              fill="#00ffff"
              opacity={0.8 - (particleX - 50) * 0.008}
            />
          );
        })}
        
        {/* Asteroid being pushed */}
        <ellipse
          cx={140 + frame * 0.05}
          cy={50}
          rx={20}
          ry={15}
          fill="#6b5b4f"
          stroke="#8b7b6f"
          strokeWidth={1}
        />
        {/* Surface ablation effect */}
        <ellipse
          cx={125 + frame * 0.05}
          cy={50}
          rx={3}
          ry={8}
          fill="#ff8844"
          opacity={0.4 + Math.sin(frame * 0.2) * 0.2}
        />
        
        {/* Spacecraft */}
        <g transform="translate(40, 50)">
          <rect x={-8} y={-5} width={16} height={10} fill="#555" stroke="#777" strokeWidth={0.5} />
          <rect x={-15} y={-2} width={7} height={4} fill="#4488ff" opacity={0.8} />
          <rect x={8} y={-2} width={7} height={4} fill="#4488ff" opacity={0.8} />
          <circle cx={8} cy={0} r={3} fill="#00ffff" opacity={beamIntensity} />
        </g>
        
        {/* Deflection indicator */}
        <path
          d={`M 160,50 L 200,${45 - frame * 0.05}`}
          fill="none"
          stroke="#00ff00"
          strokeWidth={1}
          strokeDasharray="3,2"
          opacity={0.6}
        />
        
        {/* Label */}
        <text x={100} y={95} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">
          ION BEAM DEFLECTION - {(beamIntensity * 100).toFixed(0)}% POWER
        </text>
      </svg>
    );
  };

  const renderDefaultAnimation = () => (
    <svg viewBox="0 0 200 100" className="w-full h-full">
      {/* Background stars */}
      {[...Array(15)].map((_, i) => (
        <circle
          key={i}
          cx={(i * 37 + 10) % 200}
          cy={(i * 23 + 5) % 100}
          r={0.5 + (i % 3) * 0.3}
          fill="white"
          opacity={0.3 + (i % 5) * 0.1}
        />
      ))}
      
      {/* Asteroid */}
      <ellipse
        cx={100 + Math.sin(frame * 0.02) * 5}
        cy={50}
        rx={20}
        ry={15}
        fill="#6b5b4f"
        stroke="#8b7b6f"
        strokeWidth={1}
      />
      
      {/* Orbiting spacecraft */}
      <g transform={`translate(${100 + Math.cos(frame * 0.05) * 40}, ${50 + Math.sin(frame * 0.05) * 25})`}>
        <rect x={-3} y={-2} width={6} height={4} fill="#666" />
        <rect x={-7} y={-1} width={4} height={2} fill="#4488ff" opacity={0.8} />
        <rect x={3} y={-1} width={4} height={2} fill="#4488ff" opacity={0.8} />
      </g>
      
      {/* Label */}
      <text x={100} y={95} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">
        DEFENSE SYSTEM ACTIVE
      </text>
    </svg>
  );

  const renderAnimation = () => {
    switch (strategyCode) {
      case 'DART':
        return renderKineticImpactor();
      case 'GRAV':
        return renderGravityTractor();
      case 'NUKE':
        return renderNuclearDeflection();
      case 'ION':
        return renderIonBeam();
      default:
        return renderDefaultAnimation();
    }
  };

  return (
    <div className="relative w-full h-24 bg-black/50 border border-border overflow-hidden">
      {renderAnimation()}
      {/* Sound Toggle Button */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={`absolute top-1 right-1 p-1 border transition-colors ${
          soundEnabled 
            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
            : 'bg-black/50 border-border text-muted-foreground hover:border-cyan-500 hover:text-cyan-400'
        }`}
        title={soundEnabled ? 'Mute sound' : 'Enable sound'}
      >
        {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
      </button>
    </div>
  );
};

export default DefenseAnimation;
