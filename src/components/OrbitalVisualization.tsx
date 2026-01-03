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
    <div className="relative w-full h-full min-h-[400px] artifact-panel overflow-hidden">
      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid opacity-50" />

      {/* Title */}
      <div className="absolute top-4 left-4 z-10">
        <h2 className="font-display text-lg text-foreground">
          Orbital Tracking
        </h2>
        <p className="text-[10px] text-muted-foreground tracking-wider">
          Near-Earth Object Monitor
        </p>
      </div>

      {/* SVG Visualization */}
      <svg 
        viewBox="0 0 400 400" 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        {/* Background Dot Grid */}
        <defs>
          <pattern id="dotGrid" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="0.5" fill="hsl(var(--border))" />
          </pattern>
          <pattern id="gridLines" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
          </pattern>
        </defs>

        <rect width="400" height="400" fill="url(#dotGrid)" />
        <rect width="400" height="400" fill="url(#gridLines)" />

        {/* Orbital Paths */}
        {asteroids.map((asteroid, index) => (
          <circle
            key={`orbit-${asteroid.id}`}
            cx="200"
            cy="200"
            r={getOrbitRadius(asteroid)}
            fill="none"
            stroke={selectedAsteroid?.id === asteroid.id ? 'hsl(var(--foreground))' : 'hsl(var(--border))'}
            strokeWidth={selectedAsteroid?.id === asteroid.id ? 1 : 0.5}
            strokeDasharray={selectedAsteroid?.id === asteroid.id ? 'none' : '2 4'}
            opacity={selectedAsteroid?.id === asteroid.id ? 1 : 0.5}
          />
        ))}

        {/* Earth */}
        <circle cx="200" cy="200" r="20" fill="hsl(var(--foreground))" opacity="0.1" stroke="hsl(var(--foreground))" strokeWidth="1"/>
        <text x="200" y="204" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="IBM Plex Mono">
          Earth
        </text>

        {/* Moon */}
        <circle 
          cx={200 + Math.cos((rotation * 3 * Math.PI) / 180) * 35} 
          cy={200 + Math.sin((rotation * 3 * Math.PI) / 180) * 35} 
          r="3" 
          fill="hsl(var(--muted-foreground))"
        />

        {/* Asteroids */}
        {asteroids.map((asteroid, index) => {
          const pos = getAsteroidPosition(asteroid, index);
          const isSelected = selectedAsteroid?.id === asteroid.id;
          const isHovered = hoveredAsteroid === asteroid.id;
          const size = Math.max(4, Math.min(10, asteroid.diameter / 40));
          
          return (
            <g key={asteroid.id}>
              {/* Trajectory line to Earth when selected */}
              {isSelected && (
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2="200"
                  y2="200"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
              )}
              
              {/* Asteroid */}
              <g
                onClick={() => onSelectAsteroid(asteroid)}
                onMouseEnter={() => setHoveredAsteroid(asteroid.id)}
                onMouseLeave={() => setHoveredAsteroid(null)}
                className="cursor-pointer"
              >
                {/* Simple circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size}
                  fill={isSelected || isHovered ? 'hsl(var(--foreground))' : 'transparent'}
                  stroke="hsl(var(--foreground))"
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={isSelected || isHovered ? 1 : 0.6}
                />
                
                {/* Label */}
                {(isSelected || isHovered) && (
                  <text
                    x={pos.x}
                    y={pos.y - size - 6}
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
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
          <line x1="0" y1="0" x2="50" y2="0" stroke="hsl(var(--foreground))" strokeWidth="1" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="hsl(var(--foreground))" strokeWidth="1" />
          <line x1="50" y1="-3" x2="50" y2="3" stroke="hsl(var(--foreground))" strokeWidth="1" />
          <text x="25" y="12" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8" fontFamily="IBM Plex Mono">
            1 AU
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 border border-border bg-background p-3">
        <p className="data-label mb-2">Threat Level</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-foreground opacity-60" />
            <span className="text-[10px] text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-foreground" />
            <span className="text-[10px] text-muted-foreground">Med</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-foreground" />
            <span className="text-[10px] text-muted-foreground">High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalVisualization;