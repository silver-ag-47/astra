import { useEffect, useRef, useState, useMemo } from 'react';
import { Asteroid, asteroids } from '@/data/asteroids';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrbitalVisualizationProps {
  selectedAsteroid: Asteroid | null;
  onSelectAsteroid: (asteroid: Asteroid) => void;
}

// Generate random stars for space background
const generateStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    cx: Math.random() * 800 - 200,
    cy: Math.random() * 800 - 200,
    r: Math.random() * 1 + 0.3,
    opacity: Math.random() * 0.8 + 0.2,
  }));
};

const OrbitalVisualization = ({ selectedAsteroid, onSelectAsteroid }: OrbitalVisualizationProps) => {
  const [rotation, setRotation] = useState(0);
  const [hoveredAsteroid, setHoveredAsteroid] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const stars = useMemo(() => generateStars(150), []);

  const minZoom = 0.3;
  const maxZoom = 4;

  // Dynamic distance scale based on zoom
  const getScaleDistance = () => {
    const baseScale = 1 / zoom;
    if (baseScale >= 2) return { distance: 2, label: '2 AU' };
    if (baseScale >= 1) return { distance: 1, label: '1 AU' };
    if (baseScale >= 0.5) return { distance: 0.5, label: '0.5 AU' };
    if (baseScale >= 0.25) return { distance: 0.25, label: '0.25 AU' };
    return { distance: 0.1, label: '0.1 AU' };
  };

  const scaleInfo = getScaleDistance();
  const scaleBarWidth = 50 * zoom * scaleInfo.distance;

  useEffect(() => {
    const timer = setInterval(() => {
      setRotation(prev => (prev + 0.15) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, minZoom));
  };

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

  // Calculate viewBox based on zoom level
  const viewBoxSize = 400 / zoom;
  const viewBoxOffset = (400 - viewBoxSize) / 2;

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

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="w-8 h-8 bg-black/80 border-white/20 hover:bg-white/10 hover:border-accent-cyan"
        >
          <ZoomIn className="h-4 w-4 text-white" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="w-8 h-8 bg-black/80 border-white/20 hover:bg-white/10 hover:border-accent-cyan"
        >
          <ZoomOut className="h-4 w-4 text-white" />
        </Button>
        <div className="text-center text-[10px] text-gray-400 mt-1">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* SVG Visualization */}
      <svg 
        viewBox={`${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`}
        className="w-full h-full transition-all duration-300"
        style={{ minHeight: '400px' }}
      >
        {/* Black space background */}
        <rect x="-200" y="-200" width="800" height="800" fill="#050505" />
        
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
          {/* Sun glow gradient */}
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--accent-amber))" stopOpacity="1" />
            <stop offset="40%" stopColor="hsl(var(--accent-amber))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--accent-amber))" stopOpacity="0" />
          </radialGradient>
          {/* Earth glow gradient */}
          <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--accent-cyan))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--accent-cyan))" stopOpacity="0" />
          </radialGradient>
          {/* Moon glow gradient */}
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="-200" y="-200" width="800" height="800" fill="url(#spaceGrid)" />

        {/* Sun (center of solar system) */}
        <g>
          <circle cx="50" cy="200" r="100" fill="url(#sunGlow)" />
          <circle cx="50" cy="200" r="35" fill="#fbbf24" stroke="hsl(var(--accent-amber))" strokeWidth="2"/>
          {/* Sun corona effect */}
          <circle cx="50" cy="200" r="45" fill="none" stroke="hsl(var(--accent-amber))" strokeWidth="1" opacity="0.3"/>
          <circle cx="50" cy="200" r="55" fill="none" stroke="hsl(var(--accent-amber))" strokeWidth="0.5" opacity="0.2"/>
          {/* Sun rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <line
              key={angle}
              x1={50 + Math.cos((angle * Math.PI) / 180) * 40}
              y1={200 + Math.sin((angle * Math.PI) / 180) * 40}
              x2={50 + Math.cos((angle * Math.PI) / 180) * 60}
              y2={200 + Math.sin((angle * Math.PI) / 180) * 60}
              stroke="hsl(var(--accent-amber))"
              strokeWidth="1.5"
              opacity="0.5"
            />
          ))}
          <text x="50" y="250" textAnchor="middle" fill="hsl(var(--accent-amber))" fontSize="8" fontFamily="IBM Plex Mono">
            SUN
          </text>
        </g>

        {/* Mercury's orbital path (0.39 AU from Sun) */}
        <circle 
          cx="50" 
          cy="200" 
          r="58" 
          fill="none" 
          stroke="#a1a1aa" 
          strokeWidth="0.5" 
          strokeDasharray="2 4"
          opacity="0.4"
        />
        {/* Mercury */}
        <circle 
          cx={50 + Math.cos((rotation * 4.15 * Math.PI) / 180) * 58} 
          cy={200 + Math.sin((rotation * 4.15 * Math.PI) / 180) * 58} 
          r="4" 
          fill="#a1a1aa"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        <text 
          x={50 + Math.cos((rotation * 4.15 * Math.PI) / 180) * 58} 
          y={200 + Math.sin((rotation * 4.15 * Math.PI) / 180) * 58 + 10} 
          textAnchor="middle" 
          fill="rgba(255,255,255,0.5)" 
          fontSize="5" 
          fontFamily="IBM Plex Mono"
        >
          MERCURY
        </text>

        {/* Venus's orbital path (0.72 AU from Sun) */}
        <circle 
          cx="50" 
          cy="200" 
          r="108" 
          fill="none" 
          stroke="#fcd34d" 
          strokeWidth="0.5" 
          strokeDasharray="3 6"
          opacity="0.35"
        />
        {/* Venus */}
        <circle 
          cx={50 + Math.cos((rotation * 1.62 * Math.PI) / 180) * 108} 
          cy={200 + Math.sin((rotation * 1.62 * Math.PI) / 180) * 108} 
          r="7" 
          fill="#fcd34d"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
        <text 
          x={50 + Math.cos((rotation * 1.62 * Math.PI) / 180) * 108} 
          y={200 + Math.sin((rotation * 1.62 * Math.PI) / 180) * 108 + 13} 
          textAnchor="middle" 
          fill="rgba(255,255,255,0.5)" 
          fontSize="5" 
          fontFamily="IBM Plex Mono"
        >
          VENUS
        </text>

        {/* Earth's orbital path around the Sun (1 AU) */}
        <circle 
          cx="50" 
          cy="200" 
          r="150" 
          fill="none" 
          stroke="hsl(var(--accent-cyan))" 
          strokeWidth="0.5" 
          strokeDasharray="4 8"
          opacity="0.3"
        />

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
        <circle cx="200" cy="200" r="35" fill="url(#earthGlow)" />
        <circle cx="200" cy="200" r="18" fill="#1a365d" stroke="hsl(var(--accent-cyan))" strokeWidth="1.5"/>
        <circle cx="200" cy="200" r="18" fill="none" stroke="hsl(var(--accent-green))" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6"/>
        <text x="200" y="204" textAnchor="middle" fill="white" fontSize="7" fontFamily="IBM Plex Mono">
          EARTH
        </text>

        {/* Moon with orbit and glow */}
        <circle 
          cx="200"
          cy="200"
          r="35"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
        {/* Moon glow */}
        <circle 
          cx={200 + Math.cos((rotation * 3 * Math.PI) / 180) * 35} 
          cy={200 + Math.sin((rotation * 3 * Math.PI) / 180) * 35} 
          r="8" 
          fill="url(#moonGlow)"
        />
        <circle 
          cx={200 + Math.cos((rotation * 3 * Math.PI) / 180) * 35} 
          cy={200 + Math.sin((rotation * 3 * Math.PI) / 180) * 35} 
          r="5" 
          fill="#9ca3af"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5"
        />
        {/* Moon craters */}
        <circle 
          cx={200 + Math.cos((rotation * 3 * Math.PI) / 180) * 35 - 1} 
          cy={200 + Math.sin((rotation * 3 * Math.PI) / 180) * 35 - 1} 
          r="1" 
          fill="#6b7280"
          opacity="0.6"
        />
        <circle 
          cx={200 + Math.cos((rotation * 3 * Math.PI) / 180) * 35 + 1.5} 
          cy={200 + Math.sin((rotation * 3 * Math.PI) / 180) * 35 + 0.5} 
          r="0.8" 
          fill="#6b7280"
          opacity="0.5"
        />
        <text 
          x={200 + Math.cos((rotation * 3 * Math.PI) / 180) * 35} 
          y={200 + Math.sin((rotation * 3 * Math.PI) / 180) * 35 + 12} 
          textAnchor="middle" 
          fill="rgba(255,255,255,0.6)" 
          fontSize="6" 
          fontFamily="IBM Plex Mono"
        >
          MOON
        </text>

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

        {/* Dynamic Scale indicator */}
        <g transform={`translate(${viewBoxOffset + viewBoxSize - 80}, ${viewBoxOffset + viewBoxSize - 30})`}>
          <line x1="0" y1="0" x2={scaleBarWidth} y2="0" stroke="hsl(var(--accent-cyan))" strokeWidth="1.5" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="hsl(var(--accent-cyan))" strokeWidth="1.5" />
          <line x1={scaleBarWidth} y1="-4" x2={scaleBarWidth} y2="4" stroke="hsl(var(--accent-cyan))" strokeWidth="1.5" />
          <text x={scaleBarWidth / 2} y="14" textAnchor="middle" fill="hsl(var(--accent-cyan))" fontSize="8" fontFamily="IBM Plex Mono">
            {scaleInfo.label}
          </text>
          <text x={scaleBarWidth / 2} y="-8" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="IBM Plex Mono">
            SCALE
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