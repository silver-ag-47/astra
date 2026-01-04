import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { Asteroid, asteroids } from '@/data/asteroids';
import { ZoomIn, ZoomOut, Play, Pause, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface OrbitalVisualizationProps {
  selectedAsteroid: Asteroid | null;
  onSelectAsteroid: (asteroid: Asteroid) => void;
}

// Sun component with corona and glow
const Sun = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Sun core */}
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshBasicMaterial color="#FDB813" />
      </Sphere>
      
      {/* Sun glow layer 1 */}
      <Sphere ref={glowRef} args={[2.2, 32, 32]}>
        <meshBasicMaterial color="#FF8C00" transparent opacity={0.4} />
      </Sphere>
      
      {/* Sun corona */}
      <Sphere args={[2.8, 32, 32]}>
        <meshBasicMaterial color="#FFD700" transparent opacity={0.15} />
      </Sphere>
      
      {/* Point light from sun */}
      <pointLight intensity={2} distance={100} decay={2} color="#FFF5E0" />
      
      {/* Label */}
      <Html position={[0, -3, 0]} center>
        <span className="text-[8px] text-amber-400 font-mono tracking-wider">SUN</span>
      </Html>
    </group>
  );
};

// Planet component with realistic texturing
const Planet = ({ 
  name, 
  radius, 
  orbitRadius, 
  color, 
  orbitSpeed,
  hasAtmosphere = false,
  atmosphereColor = '#88ccff'
}: { 
  name: string; 
  radius: number; 
  orbitRadius: number; 
  color: string;
  orbitSpeed: number;
  hasAtmosphere?: boolean;
  atmosphereColor?: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
    if (groupRef.current) {
      setAngle(prev => prev + delta * orbitSpeed);
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  return (
    <>
      {/* Orbit path */}
      <Ring args={[orbitRadius - 0.02, orbitRadius + 0.02, 128]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </Ring>
      
      <group ref={groupRef}>
        {/* Planet body */}
        <Sphere ref={meshRef} args={[radius, 32, 32]}>
          <meshStandardMaterial 
            color={color} 
            roughness={0.8}
            metalness={0.1}
          />
        </Sphere>
        
        {/* Atmosphere */}
        {hasAtmosphere && (
          <Sphere args={[radius * 1.15, 32, 32]}>
            <meshBasicMaterial color={atmosphereColor} transparent opacity={0.2} />
          </Sphere>
        )}
        
        {/* Label */}
        <Html position={[0, -radius - 0.8, 0]} center>
          <span className="text-[7px] text-gray-400 font-mono tracking-wider whitespace-nowrap">{name}</span>
        </Html>
      </group>
    </>
  );
};

// Earth with detailed features
const Earth = ({ orbitRadius, isPaused, timeSpeed }: { orbitRadius: number; isPaused: boolean; timeSpeed: number }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(0);
  const [moonAngle, setMoonAngle] = useState(0);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.005 * speed;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.003 * speed;
    }
    if (groupRef.current) {
      setAngle(prev => prev + delta * 0.1 * speed);
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
    if (moonRef.current) {
      setMoonAngle(prev => prev + delta * 0.5 * speed);
      moonRef.current.position.x = Math.cos(moonAngle) * 1.5;
      moonRef.current.position.z = Math.sin(moonAngle) * 1.5;
    }
  });

  return (
    <>
      {/* Earth orbit path */}
      <Ring args={[orbitRadius - 0.03, orbitRadius + 0.03, 128]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} side={THREE.DoubleSide} />
      </Ring>
      
      <group ref={groupRef}>
        {/* Earth body */}
        <Sphere ref={earthRef} args={[0.6, 64, 64]}>
          <meshStandardMaterial 
            color="#1a365d"
            roughness={0.7}
            metalness={0.1}
          />
        </Sphere>
        
        {/* Land masses overlay */}
        <Sphere args={[0.601, 64, 64]}>
          <meshStandardMaterial 
            color="#22c55e"
            roughness={0.8}
            metalness={0}
            transparent
            opacity={0.6}
          />
        </Sphere>
        
        {/* Cloud layer */}
        <Sphere ref={cloudsRef} args={[0.63, 32, 32]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </Sphere>
        
        {/* Atmosphere glow */}
        <Sphere args={[0.7, 32, 32]}>
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.15} />
        </Sphere>
        
        {/* Moon orbit path */}
        <Ring args={[1.48, 1.52, 64]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#6b7280" transparent opacity={0.15} side={THREE.DoubleSide} />
        </Ring>
        
        {/* Moon */}
        <group ref={moonRef}>
          <Sphere args={[0.15, 32, 32]}>
            <meshStandardMaterial 
              color="#9ca3af"
              roughness={1}
              metalness={0}
            />
          </Sphere>
          {/* Moon craters effect */}
          <Sphere args={[0.151, 32, 32]}>
            <meshStandardMaterial 
              color="#6b7280"
              roughness={1}
              metalness={0}
              transparent
              opacity={0.4}
            />
          </Sphere>
          <Html position={[0, -0.4, 0]} center>
            <span className="text-[6px] text-gray-500 font-mono">MOON</span>
          </Html>
        </group>
        
        {/* Earth label */}
        <Html position={[0, -1.2, 0]} center>
          <span className="text-[9px] text-cyan-400 font-mono tracking-wider font-bold">EARTH</span>
        </Html>
      </group>
    </>
  );
};

// Asteroid 3D model
const Asteroid3D = ({ 
  asteroid, 
  isSelected, 
  isHovered,
  onSelect,
  onHover,
  isPaused,
  timeSpeed,
  earthOrbitRadius
}: { 
  asteroid: Asteroid;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
  isPaused: boolean;
  timeSpeed: number;
  earthOrbitRadius: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  
  // Calculate orbit radius based on orbital period (Kepler's law)
  const semiMajorAxis = Math.pow(asteroid.orbitalPeriod, 2/3);
  const orbitRadius = earthOrbitRadius * semiMajorAxis;
  const orbitSpeed = 0.1 / asteroid.orbitalPeriod;
  
  // Threat level color
  const threatLevel = asteroid.torinoScale >= 3 ? 'high' : asteroid.torinoScale >= 1 ? 'medium' : 'low';
  const threatColor = threatLevel === 'high' ? '#ef4444' 
    : threatLevel === 'medium' ? '#f59e0b' 
    : '#22c55e';
  
  // Size based on diameter
  const size = Math.max(0.15, Math.min(0.5, asteroid.diameter / 200));

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    
    if (groupRef.current) {
      setAngle(prev => prev + delta * orbitSpeed * speed);
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed;
      meshRef.current.rotation.y += 0.015 * speed;
    }
  });

  // Irregular asteroid geometry
  const asteroidGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(size, 1);
    const positions = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const noise = (Math.random() - 0.5) * 0.3;
      positions[i] *= 1 + noise;
      positions[i + 1] *= 1 + noise * 0.8;
      positions[i + 2] *= 1 + noise;
    }
    geo.computeVertexNormals();
    return geo;
  }, [size]);

  return (
    <>
      {/* Orbit path */}
      <Ring 
        args={[orbitRadius - 0.02, orbitRadius + 0.02, 128]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial 
          color={isSelected ? threatColor : '#6b7280'} 
          transparent 
          opacity={isSelected ? 0.4 : 0.1} 
          side={THREE.DoubleSide} 
        />
      </Ring>
      
      <group ref={groupRef}>
        {/* Asteroid body */}
        <mesh
          ref={meshRef}
          geometry={asteroidGeometry}
          onClick={onSelect}
          onPointerOver={() => onHover(true)}
          onPointerOut={() => onHover(false)}
        >
          <meshStandardMaterial 
            color={isSelected || isHovered ? threatColor : '#6b7280'}
            roughness={0.9}
            metalness={0.2}
            emissive={isSelected || isHovered ? threatColor : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.15 : 0}
          />
        </mesh>
        
        {/* Glow effect for selected/hovered */}
        {(isSelected || isHovered) && (
          <Sphere args={[size * 1.5, 16, 16]}>
            <meshBasicMaterial color={threatColor} transparent opacity={0.15} />
          </Sphere>
        )}
        
        {/* Label */}
        {(isSelected || isHovered) && (
          <Html position={[0, -size - 0.5, 0]} center>
            <div className="bg-black/80 border border-white/20 px-2 py-1 rounded-none">
              <span className="text-[9px] font-mono font-bold" style={{ color: threatColor }}>
                {asteroid.name}
              </span>
              <span className="text-[7px] text-gray-400 block">
                {semiMajorAxis.toFixed(2)} AU
              </span>
            </div>
          </Html>
        )}
        
        {/* Trajectory line to Earth when selected */}
        {isSelected && (
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  0, 0, 0,
                  -Math.cos(angle) * orbitRadius + Math.cos(angle) * earthOrbitRadius,
                  0,
                  -Math.sin(angle) * orbitRadius + Math.sin(angle) * earthOrbitRadius
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={threatColor} transparent opacity={0.5} linewidth={2} />
          </line>
        )}
      </group>
    </>
  );
};

// Camera controller
const CameraController = ({ zoom, onZoomChange }: { zoom: number; onZoomChange: (z: number) => void }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const distance = 30 / zoom;
    camera.position.set(0, distance * 0.8, distance);
    camera.lookAt(0, 0, 0);
  }, [zoom, camera]);

  return <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />;
};

const OrbitalVisualization = ({ selectedAsteroid, onSelectAsteroid }: OrbitalVisualizationProps) => {
  const [hoveredAsteroid, setHoveredAsteroid] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.6);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const minZoom = 0.25;
  const maxZoom = 3;
  const earthOrbitRadius = 8;

  const getSpeedLabel = () => {
    if (isPaused) return 'PAUSED';
    if (timeSpeed === 0.25) return '0.25×';
    if (timeSpeed === 0.5) return '0.5×';
    if (timeSpeed === 1) return '1×';
    if (timeSpeed === 2) return '2×';
    if (timeSpeed === 4) return '4×';
    return `${timeSpeed}×`;
  };

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, maxZoom));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, minZoom));
  const handleResetView = () => setZoom(0.6);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#050505] border border-border transition-all duration-300 ${
        isFullscreen ? 'min-h-screen' : 'min-h-[300px]'
      }`}
    >
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 25, 35], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          
          {/* Star field */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
          
          {/* Sun */}
          <Sun />
          
          {/* Mercury */}
          <Planet 
            name="MERCURY"
            radius={0.2}
            orbitRadius={earthOrbitRadius * 0.39}
            color="#a1a1aa"
            orbitSpeed={isPaused ? 0 : 0.415 * timeSpeed}
          />
          
          {/* Venus */}
          <Planet 
            name="VENUS"
            radius={0.4}
            orbitRadius={earthOrbitRadius * 0.72}
            color="#fcd34d"
            orbitSpeed={isPaused ? 0 : 0.162 * timeSpeed}
            hasAtmosphere
            atmosphereColor="#fef3c7"
          />
          
          {/* Earth with Moon */}
          <Earth 
            orbitRadius={earthOrbitRadius}
            isPaused={isPaused}
            timeSpeed={timeSpeed}
          />
          
          {/* Asteroids */}
          {asteroids.map((asteroid) => (
            <Asteroid3D
              key={asteroid.id}
              asteroid={asteroid}
              isSelected={selectedAsteroid?.id === asteroid.id}
              isHovered={hoveredAsteroid === asteroid.id}
              onSelect={() => onSelectAsteroid(asteroid)}
              onHover={(hover) => setHoveredAsteroid(hover ? asteroid.id : null)}
              isPaused={isPaused}
              timeSpeed={timeSpeed}
              earthOrbitRadius={earthOrbitRadius}
            />
          ))}
          
          {/* Camera controls */}
          <CameraController zoom={zoom} onZoomChange={setZoom} />
        </Suspense>
      </Canvas>

      {/* Title */}
      <div className="absolute top-2 left-2 z-10">
        <h2 className="font-display text-sm text-white">
          Orbital Tracking
        </h2>
        <p className="text-[9px] text-gray-400 tracking-wider">
          3D NEO Monitor
        </p>
      </div>

      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-accent-cyan"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-3 w-3 text-white" />
          ) : (
            <Maximize2 className="h-3 w-3 text-white" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetView}
          className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-accent-cyan"
          title="Reset View"
        >
          <RotateCcw className="h-3 w-3 text-white" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-accent-cyan"
        >
          <ZoomIn className="h-3 w-3 text-white" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-accent-cyan"
        >
          <ZoomOut className="h-3 w-3 text-white" />
        </Button>
        <div className="text-center text-[8px] text-gray-400 mt-0.5">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Time Controls */}
      <div className="absolute top-12 left-2 z-10 border border-white/20 bg-black/80 p-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
            className="w-5 h-5 bg-black/80 border-white/20 hover:bg-white/10 hover:border-accent-cyan"
          >
            {isPaused ? (
              <Play className="h-2.5 w-2.5 text-green-400" />
            ) : (
              <Pause className="h-2.5 w-2.5 text-amber-400" />
            )}
          </Button>
          <span className="text-[9px] text-cyan-400 font-mono">
            {getSpeedLabel()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[7px] text-gray-500">S</span>
          <Slider
            value={[timeSpeed]}
            onValueChange={(value) => setTimeSpeed(value[0])}
            min={0.25}
            max={4}
            step={0.25}
            className="w-14"
          />
          <span className="text-[7px] text-gray-500">F</span>
        </div>
      </div>

      {/* 3D Controls hint */}
      <div className="absolute bottom-12 left-2 z-10 border border-white/20 bg-black/80 p-2">
        <p className="text-[8px] text-gray-400 uppercase tracking-wider mb-1">3D Controls</p>
        <div className="space-y-0.5 text-[7px] text-gray-500">
          <div>🖱️ Drag to rotate</div>
          <div>⚙️ Scroll to zoom</div>
          <div>⇧+Drag to pan</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 border border-white/20 bg-black/80 p-2">
        <p className="text-[8px] text-gray-400 uppercase tracking-wider mb-1">Threat</p>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[8px] text-gray-400">L</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[8px] text-gray-400">M</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[8px] text-gray-400">H</span>
          </div>
        </div>
      </div>

      {/* Orbital Periods Panel */}
      <div className="absolute bottom-2 right-2 border border-white/20 bg-black/80 p-2 z-10">
        <p className="text-[8px] text-gray-400 uppercase tracking-wider mb-1">Orbital Periods</p>
        <div className="space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#a1a1aa' }} />
              <span className="text-[8px] text-gray-400">Mer</span>
            </div>
            <span className="text-[8px] text-cyan-400 font-mono">88d</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#fcd34d' }} />
              <span className="text-[8px] text-gray-400">Ven</span>
            </div>
            <span className="text-[8px] text-cyan-400 font-mono">225d</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[8px] text-gray-400">Ear</span>
            </div>
            <span className="text-[8px] text-cyan-400 font-mono">365d</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalVisualization;
