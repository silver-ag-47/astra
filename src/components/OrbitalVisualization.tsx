import { useEffect, useRef, useState } from 'react';
import { Asteroid, asteroids } from '@/data/asteroids';

interface OrbitalVisualizationProps {
  selectedAsteroid: Asteroid | null;
  onSelectAsteroid: (asteroid: Asteroid) => void;
}

const OrbitalVisualization = ({ selectedAsteroid, onSelectAsteroid }: OrbitalVisualizationProps) => {
  const [rotation, setRotation] = useState(0);
  const [hoveredAsteroid, setHoveredAsteroid] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360);
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
    <div className="relative w-full h-full min-h-[400px] brutalist-panel overflow-hidden">
      {/* Radar Sweep Effect */}
      <div className="absolute inset-0 radar-sweep opacity-30" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <h2 className="font-display text-lg tracking-[0.2em] text-foreground">
          ORBITAL TRACKING
        </h2>
        <p className="text-[10px] text-muted-foreground tracking-wider">
          NEAR-EARTH OBJECT MONITOR
        </p>
      </div>

      {/* SVG Visualization */}
      <svg 
        viewBox="0 0 400 400" 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        {/* Background Grid */}
        <defs>
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(0, 100%, 50%)" strokeWidth="0.3" opacity="0.2"/>
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)"/>
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="hsl(0, 100%, 50%)" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="400" height="400" fill="url(#grid)" />

        {/* Orbital Paths */}
        {asteroids.map((asteroid, index) => (
          <circle
            key={`orbit-${asteroid.id}`}
            cx="200"
            cy="200"
            r={getOrbitRadius(asteroid)}
            fill="none"
            stroke={selectedAsteroid?.id === asteroid.id ? 'hsl(0, 100%, 50%)' : 'hsl(0, 0%, 40%)'}
            strokeWidth={selectedAsteroid?.id === asteroid.id ? 2 : 0.5}
            strokeDasharray={selectedAsteroid?.id === asteroid.id ? 'none' : '4 4'}
            opacity={selectedAsteroid?.id === asteroid.id ? 1 : 0.3}
          />
        ))}

        {/* Earth */}
        <circle cx="200" cy="200" r="25" fill="hsl(210, 100%, 30%)" stroke="hsl(210, 100%, 50%)" strokeWidth="2"/>
        <text x="200" y="205" textAnchor="middle" fill="white" fontSize="10" fontFamily="Bebas Neue">
          EARTH
        </text>

        {/* Moon */}
        <circle 
          cx={200 + Math.cos((rotation * 3 * Math.PI) / 180) * 40} 
          cy={200 + Math.sin((rotation * 3 * Math.PI) / 180) * 40} 
          r="5" 
          fill="hsl(0, 0%, 70%)"
        />

        {/* Asteroids */}
        {asteroids.map((asteroid, index) => {
          const pos = getAsteroidPosition(asteroid, index);
          const isSelected = selectedAsteroid?.id === asteroid.id;
          const isHovered = hoveredAsteroid === asteroid.id;
          const size = Math.max(6, Math.min(15, asteroid.diameter / 30));
          
          return (
            <g key={asteroid.id}>
              {/* Trajectory line to Earth when selected */}
              {isSelected && (
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2="200"
                  y2="200"
                  stroke="hsl(0, 100%, 50%)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  className="animate-trajectory"
                  style={{ strokeDasharray: '8 4', animation: 'trajectory 2s linear infinite' }}
                />
              )}
              
              {/* Asteroid */}
              <g
                onClick={() => onSelectAsteroid(asteroid)}
                onMouseEnter={() => setHoveredAsteroid(asteroid.id)}
                onMouseLeave={() => setHoveredAsteroid(null)}
                className="cursor-pointer"
                filter={isSelected || isHovered ? 'url(#glow)' : undefined}
              >
                {/* Diamond shape */}
                <polygon
                  points={`${pos.x},${pos.y - size} ${pos.x + size},${pos.y} ${pos.x},${pos.y + size} ${pos.x - size},${pos.y}`}
                  fill={asteroid.torinoScale >= 3 ? 'hsl(0, 100%, 50%)' : asteroid.torinoScale >= 1 ? 'hsl(45, 100%, 50%)' : 'hsl(120, 100%, 50%)'}
                  stroke={isSelected ? 'white' : 'none'}
                  strokeWidth={2}
                  className={isSelected || isHovered ? 'animate-pulse' : ''}
                />
                
                {/* Label */}
                {(isSelected || isHovered) && (
                  <text
                    x={pos.x}
                    y={pos.y - size - 8}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontFamily="IBM Plex Mono"
                    fontWeight="bold"
                  >
                    {asteroid.name}
                  </text>
                )}
              </g>
            </g>
          );
        })}

        {/* Compass */}
        <g transform="translate(350, 350)">
          <circle cx="0" cy="0" r="25" fill="none" stroke="hsl(0, 0%, 50%)" strokeWidth="1"/>
          <text x="0" y="-30" textAnchor="middle" fill="hsl(0, 100%, 50%)" fontSize="10" fontFamily="Bebas Neue">N</text>
          <line x1="0" y1="-20" x2="0" y2="-10" stroke="hsl(0, 100%, 50%)" strokeWidth="2"/>
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 border-2 border-border p-3">
        <p className="text-[9px] text-muted-foreground tracking-wider mb-2">THREAT LEVEL</p>
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <div className="status-diamond bg-terminal" />
            <span className="text-[10px] text-muted-foreground">LOW</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="status-diamond bg-accent" />
            <span className="text-[10px] text-muted-foreground">MED</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="status-diamond bg-primary animate-blink" />
            <span className="text-[10px] text-muted-foreground">HIGH</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalVisualization;
