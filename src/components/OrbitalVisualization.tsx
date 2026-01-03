import { useEffect, useRef, useState, useMemo } from 'react';
import { Asteroid, asteroids } from '@/data/asteroids';

interface OrbitalVisualizationProps {
  selectedAsteroid: Asteroid | null;
  onSelectAsteroid: (asteroid: Asteroid) => void;
}

// Generate random stars for space background
const generateStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    cx: Math.random() * 400,
    cy: Math.random() * 400,
    r: Math.random() * 1 + 0.3,
    opacity: Math.random() * 0.8 + 0.2,
  }));
};

const OrbitalVisualization = ({ selectedAsteroid, onSelectAsteroid }: OrbitalVisualizationProps) => {
  const [rotation, setRotation] = useState(0);
  const [hoveredAsteroid, setHoveredAsteroid] = useState<string | null>(null);
  const stars = useMemo(() => generateStars(100), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotation(prev => (prev + 0.15) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const getAsteroidPosition = (asteroid: Asteroid, index: number) => {
    const baseAngle = (index * 60) + rotation;
    const radians = (baseAngle * Math.PI) / 180;
    const distance = 120 + (asteroid.distance * 1000);
    return {
      x: 200 + Math.cos(radians) * Math.min(distance, 170),
      y: 200 + Math.sin(radians) * Math.min(distance, 170),
    };
  };

  const getOrbitRadius = (asteroid: Asteroid) => {
    return 100 + (asteroid.orbitalPeriod * 30);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-[#050505] border border-border">
      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <h2 className="font-display text-lg text-white">
          Orbital Tracking
        </h2>
        <p className="text-[10px] text-gray-400 tracking-wider">
          Near-Earth Object Monitor
        </p>
      </div>

      {/* SVG Visualization */}
      <svg 
        viewBox="0 0 400 400" 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        {/* Black space background */}
        <rect width="400" height="400" fill="#050505" />
        
        {/* Stars */}
        {stars.map((star) => (
          <circle
            key={star.id}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="white"
            opacity={star.opacity}
          />
        ))}
        
        {/* Subtle grid overlay */}
        <defs>
          <pattern id="spaceGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#spaceGrid)" />

        {/* Orbital Paths */}
        {asteroids.map((asteroid, index) => (
          <circle
            key={`orbit-${asteroid.id}`}
            cx="200"
            cy="200"
            r={getOrbitRadius(asteroid)}
            fill="none"
            stroke={selectedAsteroid?.id === asteroid.id ? 'hsl(var(--accent-cyan))' : 'rgba(255,255,255,0.15)'}
            strokeWidth={selectedAsteroid?.id === asteroid.id ? 1.5 : 0.5}
            strokeDasharray={selectedAsteroid?.id === asteroid.id ? 'none' : '2 4'}
            opacity={selectedAsteroid?.id === asteroid.id ? 1 : 0.6}
          />
        ))}

        {/* Earth with glow */}
        <defs>
          <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--accent-cyan))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--accent-cyan))" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="35" fill="url(#earthGlow)" />
        <circle cx="200" cy="200" r="18" fill="#1a365d" stroke="hsl(var(--accent-cyan))" strokeWidth="1.5"/>
        <circle cx="200" cy="200" r="18" fill="none" stroke="hsl(var(--accent-green))" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6"/>
        <text x="200" y="204" textAnchor="middle" fill="white" fontSize="7" fontFamily="IBM Plex Mono">
          EARTH
        </text>

        {/* Moon with orbit */}
        <circle 
          cx="200"
          cy="200"
          r="35"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        <circle 
          cx={200 + Math.cos((rotation * 3 * Math.PI) / 180) * 35} 
          cy={200 + Math.sin((rotation * 3 * Math.PI) / 180) * 35} 
          r="4" 
          fill="#4a5568"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />

        {/* Asteroids */}
        {asteroids.map((asteroid, index) => {
          const pos = getAsteroidPosition(asteroid, index);
          const isSelected = selectedAsteroid?.id === asteroid.id;
          const isHovered = hoveredAsteroid === asteroid.id;
          const size = Math.max(4, Math.min(10, asteroid.diameter / 40));
          // Derive threat level from Torino scale
          const threatLevel = asteroid.torinoScale >= 3 ? 'high' : asteroid.torinoScale >= 1 ? 'medium' : 'low';
          const threatColor = threatLevel === 'high' ? 'hsl(var(--accent-red))' 
            : threatLevel === 'medium' ? 'hsl(var(--accent-amber))' 
            : 'hsl(var(--accent-green))';
          
          return (
            <g key={asteroid.id}>
              {/* Trajectory line to Earth when selected */}
              {isSelected && (
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2="200"
                  y2="200"
                  stroke={threatColor}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
              )}
              
              {/* Asteroid glow */}
              {(isSelected || isHovered) && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size + 6}
                  fill={threatColor}
                  opacity="0.2"
                />
              )}
              
              {/* Asteroid */}
              <g
                onClick={() => onSelectAsteroid(asteroid)}
                onMouseEnter={() => setHoveredAsteroid(asteroid.id)}
                onMouseLeave={() => setHoveredAsteroid(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size}
                  fill={isSelected || isHovered ? threatColor : '#6b7280'}
                  stroke={threatColor}
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={isSelected || isHovered ? 1 : 0.7}
                />
                
                {/* Label */}
                {(isSelected || isHovered) && (
                  <text
                    x={pos.x}
                    y={pos.y - size - 8}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    fontFamily="IBM Plex Mono"
                  >
                    {asteroid.name}
                  </text>
                )}
              </g>
            </g>
          );
        })}

        {/* Scale indicator */}
        <g transform="translate(320, 370)">
          <line x1="0" y1="0" x2="50" y2="0" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <line x1="50" y1="-3" x2="50" y2="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <text x="25" y="12" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="IBM Plex Mono">
            1 AU
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 border border-white/20 bg-black/80 p-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Threat Level</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-green" />
            <span className="text-[10px] text-gray-400">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-amber" />
            <span className="text-[10px] text-gray-400">Med</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-red" />
            <span className="text-[10px] text-gray-400">High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalVisualization;