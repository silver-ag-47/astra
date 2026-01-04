import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Sphere, Ring, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Asteroid, asteroids } from '@/data/asteroids';
import { ZoomIn, ZoomOut, Play, Pause, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface OrbitalVisualizationProps {
  selectedAsteroid: Asteroid | null;
  onSelectAsteroid: (asteroid: Asteroid) => void;
}

// Asteroid visual properties based on their characteristics
const getAsteroidProperties = (asteroid: Asteroid) => {
  const baseProps = {
    color: '#6b7280',
    emissiveColor: '#000000',
    roughness: 0.9,
    metalness: 0.1,
    type: 'rocky' as 'rocky' | 'metallic' | 'carbonaceous' | 'icy'
  };

  // Assign properties based on asteroid characteristics
  switch (asteroid.id) {
    case '2024-yr4':
      return {
        ...baseProps,
        color: '#8B4513', // Saddle brown - S-type silicate
        emissiveColor: '#3d2106',
        type: 'rocky' as const,
        roughness: 0.95,
        metalness: 0.05
      };
    case 'apophis':
      return {
        ...baseProps,
        color: '#CD853F', // Peru - Sq-type silicate
        emissiveColor: '#5a3a1c',
        type: 'rocky' as const,
        roughness: 0.85,
        metalness: 0.15
      };
    case '2023-dw':
      return {
        ...baseProps,
        color: '#2F4F4F', // Dark slate gray - C-type carbonaceous
        emissiveColor: '#1a2a2a',
        type: 'carbonaceous' as const,
        roughness: 0.98,
        metalness: 0.02
      };
    case '2021-qm1':
      return {
        ...baseProps,
        color: '#696969', // Dim gray - X-type metallic
        emissiveColor: '#333333',
        type: 'metallic' as const,
        roughness: 0.7,
        metalness: 0.4
      };
    case '2018-vp1':
      return {
        ...baseProps,
        color: '#A0522D', // Sienna - small rocky body
        emissiveColor: '#4a2515',
        type: 'rocky' as const,
        roughness: 0.92,
        metalness: 0.08
      };
    case 'bennu':
      return {
        ...baseProps,
        color: '#1C1C1C', // Very dark - B-type carbonaceous (OSIRIS-REx confirmed)
        emissiveColor: '#0a0a0a',
        type: 'carbonaceous' as const,
        roughness: 0.99,
        metalness: 0.01
      };
    default:
      return baseProps;
  }
};

// Generate procedural asteroid geometry with unique shapes
const createAsteroidGeometry = (asteroid: Asteroid, seed: number) => {
  const size = Math.max(0.12, Math.min(0.6, asteroid.diameter / 150));
  
  // Different base geometries for variety
  let geo: THREE.BufferGeometry;
  const shapeType = seed % 4;
  
  switch (shapeType) {
    case 0: // Potato-like (icosahedron base)
      geo = new THREE.IcosahedronGeometry(size, 2);
      break;
    case 1: // Elongated (dodecahedron stretched)
      geo = new THREE.DodecahedronGeometry(size, 1);
      break;
    case 2: // Angular (octahedron with noise)
      geo = new THREE.OctahedronGeometry(size, 2);
      break;
    default: // Rounded rubble (sphere with deformation)
      geo = new THREE.SphereGeometry(size, 16, 12);
  }

  // Apply procedural deformation
  const positions = geo.attributes.position.array as Float32Array;
  const random = mulberry32(seed);
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Create craters and bumps
    const noise1 = (random() - 0.5) * 0.35;
    const noise2 = (random() - 0.5) * 0.2;
    const noise3 = (random() - 0.5) * 0.15;
    
    // Apply non-uniform deformation for more realistic shape
    positions[i] *= 1 + noise1 + Math.sin(y * 5) * 0.1;
    positions[i + 1] *= 1 + noise2 * 0.7 + Math.cos(x * 4) * 0.08;
    positions[i + 2] *= 1 + noise3 + Math.sin(x * y * 3) * 0.12;
  }
  
  geo.computeVertexNormals();
  return { geometry: geo, size };
};

// Seeded random number generator for consistent shapes
const mulberry32 = (a: number) => {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

// Sun component with realistic corona and flares
const Sun = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
    }
    if (coronaRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      coronaRef.current.scale.set(pulse, pulse, pulse);
    }
    if (flareRef.current) {
      flareRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Sun photosphere */}
      <Sphere ref={meshRef} args={[2.5, 64, 64]}>
        <meshStandardMaterial 
          color="#FDB813"
          emissive="#FF6B00"
          emissiveIntensity={0.8}
          roughness={1}
          metalness={0}
        />
      </Sphere>
      
      {/* Chromosphere layer */}
      <Sphere args={[2.7, 48, 48]}>
        <meshBasicMaterial color="#FF8C00" transparent opacity={0.5} />
      </Sphere>
      
      {/* Inner corona */}
      <Sphere ref={coronaRef} args={[3.2, 32, 32]}>
        <meshBasicMaterial color="#FFD700" transparent opacity={0.25} />
      </Sphere>
      
      {/* Outer corona */}
      <Sphere args={[4, 32, 32]}>
        <meshBasicMaterial color="#FFF8DC" transparent opacity={0.1} />
      </Sphere>
      
      {/* Solar flares */}
      <group ref={flareRef}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <mesh key={i} position={[
            Math.cos(angle * Math.PI / 180) * 2.6,
            Math.sin(angle * Math.PI / 180) * 2.6,
            0
          ]} rotation={[0, 0, angle * Math.PI / 180]}>
            <coneGeometry args={[0.15, 0.8, 8]} />
            <meshBasicMaterial color="#FF4500" transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
      
      {/* Point light */}
      <pointLight intensity={3} distance={150} decay={2} color="#FFF5E0" />
      <pointLight intensity={1} distance={50} decay={2} color="#FFD700" />
      
      <Html position={[0, -3.8, 0]} center>
        <span className="text-[10px] text-amber-400 font-mono tracking-widest font-bold">☉ SUN</span>
      </Html>
    </group>
  );
};

// Enhanced planet with atmosphere and surface details
const Planet = ({ 
  name, 
  radius, 
  orbitRadius, 
  color,
  surfaceColor,
  orbitSpeed,
  hasAtmosphere = false,
  atmosphereColor = '#88ccff',
  atmosphereThickness = 1.15,
  tilt = 0,
  isPaused,
  timeSpeed
}: { 
  name: string; 
  radius: number; 
  orbitRadius: number; 
  color: string;
  surfaceColor?: string;
  orbitSpeed: number;
  hasAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereThickness?: number;
  tilt?: number;
  isPaused: boolean;
  timeSpeed: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008 * speed;
    }
    if (groupRef.current) {
      setAngle(prev => prev + delta * orbitSpeed * speed);
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  return (
    <>
      {/* Orbit path with glow */}
      <Ring args={[orbitRadius - 0.04, orbitRadius + 0.04, 128]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </Ring>
      
      <group ref={groupRef}>
        <group rotation={[tilt * Math.PI / 180, 0, 0]}>
          {/* Planet surface */}
          <Sphere ref={meshRef} args={[radius, 48, 48]}>
            <meshStandardMaterial 
              color={color}
              roughness={0.85}
              metalness={0.1}
            />
          </Sphere>
          
          {/* Surface detail layer */}
          {surfaceColor && (
            <Sphere args={[radius * 1.002, 48, 48]}>
              <meshStandardMaterial 
                color={surfaceColor}
                transparent
                opacity={0.4}
                roughness={0.9}
              />
            </Sphere>
          )}
          
          {/* Atmosphere layers */}
          {hasAtmosphere && (
            <>
              <Sphere args={[radius * atmosphereThickness, 32, 32]}>
                <meshBasicMaterial color={atmosphereColor} transparent opacity={0.2} />
              </Sphere>
              <Sphere args={[radius * (atmosphereThickness + 0.1), 32, 32]}>
                <meshBasicMaterial color={atmosphereColor} transparent opacity={0.08} />
              </Sphere>
            </>
          )}
        </group>
        
        <Html position={[0, -radius - 0.6, 0]} center>
          <span className="text-[8px] text-gray-400 font-mono tracking-wider whitespace-nowrap">{name}</span>
        </Html>
      </group>
    </>
  );
};

// High-fidelity Earth with continents, clouds, and realistic moon
const Earth = ({ orbitRadius, isPaused, timeSpeed }: { orbitRadius: number; isPaused: boolean; timeSpeed: number }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(0);
  const [moonAngle, setMoonAngle] = useState(0);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.004 * speed;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.002 * speed;
      cloudsRef.current.rotation.x += 0.0005 * speed;
    }
    if (groupRef.current) {
      setAngle(prev => prev + delta * 0.1 * speed);
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
    if (moonGroupRef.current) {
      setMoonAngle(prev => prev + delta * 0.4 * speed);
      moonGroupRef.current.position.x = Math.cos(moonAngle) * 1.8;
      moonGroupRef.current.position.z = Math.sin(moonAngle) * 1.8;
      moonGroupRef.current.position.y = Math.sin(moonAngle * 0.5) * 0.2;
    }
  });

  return (
    <>
      {/* Earth orbit */}
      <Ring args={[orbitRadius - 0.05, orbitRadius + 0.05, 256]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} side={THREE.DoubleSide} />
      </Ring>
      
      <group ref={groupRef}>
        {/* Earth with 23.5° axial tilt */}
        <group rotation={[23.5 * Math.PI / 180, 0, 0]}>
          {/* Ocean base */}
          <Sphere ref={earthRef} args={[0.7, 64, 64]}>
            <meshStandardMaterial 
              color="#1e3a5f"
              roughness={0.6}
              metalness={0.1}
            />
          </Sphere>
          
          {/* Continents */}
          <Sphere args={[0.702, 64, 64]}>
            <meshStandardMaterial 
              color="#2d5a27"
              transparent
              opacity={0.7}
              roughness={0.9}
            />
          </Sphere>
          
          {/* Ice caps */}
          <Sphere args={[0.703, 64, 64]}>
            <meshStandardMaterial 
              color="#f0f8ff"
              transparent
              opacity={0.4}
              roughness={0.3}
              metalness={0.1}
            />
          </Sphere>
          
          {/* Cloud layer */}
          <Sphere ref={cloudsRef} args={[0.74, 48, 48]}>
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
          </Sphere>
          
          {/* Inner atmosphere (blue glow) */}
          <Sphere args={[0.78, 32, 32]}>
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.2} />
          </Sphere>
          
          {/* Outer atmosphere */}
          <Sphere args={[0.85, 32, 32]}>
            <meshBasicMaterial color="#93c5fd" transparent opacity={0.1} />
          </Sphere>
        </group>
        
        {/* Moon orbit ring */}
        <Ring args={[1.75, 1.85, 64]} rotation={[-Math.PI / 2 + 0.09, 0, 0]}>
          <meshBasicMaterial color="#6b7280" transparent opacity={0.1} side={THREE.DoubleSide} />
        </Ring>
        
        {/* Moon */}
        <group ref={moonGroupRef}>
          {/* Moon body with maria (dark spots) */}
          <Sphere args={[0.18, 32, 32]}>
            <meshStandardMaterial 
              color="#c9c9c9"
              roughness={1}
              metalness={0}
            />
          </Sphere>
          {/* Mare regions */}
          <Sphere args={[0.181, 32, 32]}>
            <meshStandardMaterial 
              color="#4a4a4a"
              transparent
              opacity={0.3}
              roughness={1}
            />
          </Sphere>
          <Html position={[0, -0.35, 0]} center>
            <span className="text-[6px] text-gray-500 font-mono tracking-wide">MOON</span>
          </Html>
        </group>
        
        <Html position={[0, -1.3, 0]} center>
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest font-bold">🌍 EARTH</span>
        </Html>
      </group>
    </>
  );
};

// High-fidelity asteroid with unique shape and properties
const Asteroid3D = ({ 
  asteroid, 
  index,
  isSelected, 
  isHovered,
  onSelect,
  onHover,
  isPaused,
  timeSpeed,
  earthOrbitRadius
}: { 
  asteroid: Asteroid;
  index: number;
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
  const trailRef = useRef<THREE.Points>(null);
  const [angle, setAngle] = useState(index * 1.2 + Math.random() * 0.5);
  
  // Calculate accurate orbit based on orbital period using Kepler's third law
  const semiMajorAxis = Math.pow(asteroid.orbitalPeriod, 2/3);
  const orbitRadius = earthOrbitRadius * semiMajorAxis;
  const orbitSpeed = 0.1 / asteroid.orbitalPeriod;
  
  // Get asteroid visual properties
  const asteroidProps = useMemo(() => getAsteroidProperties(asteroid), [asteroid]);
  
  // Create unique asteroid geometry
  const { geometry, size } = useMemo(() => 
    createAsteroidGeometry(asteroid, index * 12345 + asteroid.diameter),
  [asteroid, index]);
  
  // Threat level color
  const threatLevel = asteroid.torinoScale >= 3 ? 'high' : asteroid.torinoScale >= 1 ? 'medium' : 'low';
  const threatColor = threatLevel === 'high' ? '#ef4444' 
    : threatLevel === 'medium' ? '#f59e0b' 
    : '#22c55e';

  // Trail positions
  const trailPositions = useMemo(() => {
    const positions = new Float32Array(30 * 3);
    for (let i = 0; i < 30; i++) {
      const trailAngle = angle - i * 0.05;
      positions[i * 3] = Math.cos(trailAngle) * orbitRadius;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.sin(trailAngle) * orbitRadius;
    }
    return positions;
  }, [angle, orbitRadius]);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    
    if (groupRef.current) {
      setAngle(prev => prev + delta * orbitSpeed * speed);
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
      // Add slight orbital inclination variation
      groupRef.current.position.y = Math.sin(angle * 2) * 0.3;
    }
    if (meshRef.current) {
      // Tumbling rotation
      meshRef.current.rotation.x += 0.008 * speed;
      meshRef.current.rotation.y += 0.012 * speed;
      meshRef.current.rotation.z += 0.005 * speed;
    }
  });

  return (
    <>
      {/* Orbit path */}
      <Ring 
        args={[orbitRadius - 0.03, orbitRadius + 0.03, 128]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial 
          color={isSelected ? threatColor : asteroidProps.color} 
          transparent 
          opacity={isSelected ? 0.35 : 0.08} 
          side={THREE.DoubleSide} 
        />
      </Ring>
      
      {/* Trail effect when selected */}
      {isSelected && (
        <points ref={trailRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={30}
              array={trailPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial color={threatColor} size={0.05} transparent opacity={0.4} />
        </points>
      )}
      
      <group ref={groupRef}>
        {/* Asteroid body */}
        <mesh
          ref={meshRef}
          geometry={geometry}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
          onPointerOut={() => onHover(false)}
        >
          <meshStandardMaterial 
            color={isSelected || isHovered ? threatColor : asteroidProps.color}
            roughness={asteroidProps.roughness}
            metalness={asteroidProps.metalness}
            emissive={isSelected || isHovered ? threatColor : asteroidProps.emissiveColor}
            emissiveIntensity={isSelected ? 0.4 : isHovered ? 0.25 : 0.05}
          />
        </mesh>
        
        {/* Surface detail bump */}
        <mesh geometry={geometry} scale={1.02}>
          <meshStandardMaterial 
            color={asteroidProps.color}
            transparent
            opacity={0.15}
            roughness={1}
          />
        </mesh>
        
        {/* Selection/hover glow */}
        {(isSelected || isHovered) && (
          <>
            <Sphere args={[size * 1.8, 16, 16]}>
              <meshBasicMaterial color={threatColor} transparent opacity={0.12} />
            </Sphere>
            <Sphere args={[size * 2.5, 16, 16]}>
              <meshBasicMaterial color={threatColor} transparent opacity={0.05} />
            </Sphere>
          </>
        )}
        
        {/* Info label */}
        {(isSelected || isHovered) && (
          <Html position={[0, -size - 0.6, 0]} center>
            <div className="bg-black/90 border px-2 py-1.5 min-w-[100px]" style={{ borderColor: threatColor }}>
              <div className="text-[10px] font-mono font-bold mb-0.5" style={{ color: threatColor }}>
                {asteroid.name}
              </div>
              <div className="text-[8px] text-gray-400 space-y-0.5">
                <div className="flex justify-between gap-3">
                  <span>Diameter:</span>
                  <span className="text-white">{asteroid.diameter}m</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Orbit:</span>
                  <span className="text-white">{semiMajorAxis.toFixed(2)} AU</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Period:</span>
                  <span className="text-white">{asteroid.orbitalPeriod.toFixed(2)}y</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Torino:</span>
                  <span style={{ color: threatColor }}>{asteroid.torinoScale}</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
};

// Camera controller with smooth transitions
const CameraController = ({ zoom }: { zoom: number }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const distance = 35 / zoom;
    camera.position.set(0, distance * 0.7, distance);
    camera.lookAt(0, 0, 0);
  }, [zoom, camera]);

  return (
    <OrbitControls 
      enablePan={true} 
      enableZoom={true} 
      enableRotate={true}
      minDistance={5}
      maxDistance={100}
      zoomSpeed={0.8}
      rotateSpeed={0.5}
    />
  );
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
  const earthOrbitRadius = 10;

  const getSpeedLabel = () => {
    if (isPaused) return 'PAUSED';
    return `${timeSpeed}×`;
  };

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#020205] border border-border transition-all duration-300 ${
        isFullscreen ? 'min-h-screen' : 'min-h-[300px]'
      }`}
    >
      <Canvas camera={{ position: [0, 20, 40], fov: 50 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <color attach="background" args={['#020205']} />
          <fog attach="fog" args={['#020205', 50, 150]} />
          
          <ambientLight intensity={0.08} />
          
          {/* Deep space stars */}
          <Stars 
            radius={200} 
            depth={100} 
            count={8000} 
            factor={5} 
            saturation={0.1} 
            fade 
            speed={0.3} 
          />
          
          {/* Sun */}
          <Sun />
          
          {/* Mercury - 0.39 AU */}
          <Planet 
            name="MERCURY"
            radius={0.25}
            orbitRadius={earthOrbitRadius * 0.39}
            color="#8c8c8c"
            surfaceColor="#5c5c5c"
            orbitSpeed={0.415}
            tilt={0.03}
            isPaused={isPaused}
            timeSpeed={timeSpeed}
          />
          
          {/* Venus - 0.72 AU */}
          <Planet 
            name="VENUS"
            radius={0.55}
            orbitRadius={earthOrbitRadius * 0.72}
            color="#e6c87a"
            surfaceColor="#d4a84b"
            orbitSpeed={0.162}
            hasAtmosphere
            atmosphereColor="#fff5d4"
            atmosphereThickness={1.2}
            tilt={177.4}
            isPaused={isPaused}
            timeSpeed={timeSpeed}
          />
          
          {/* Earth with Moon - 1 AU */}
          <Earth 
            orbitRadius={earthOrbitRadius}
            isPaused={isPaused}
            timeSpeed={timeSpeed}
          />
          
          {/* Mars hint at edge - 1.52 AU */}
          <Planet 
            name="MARS"
            radius={0.4}
            orbitRadius={earthOrbitRadius * 1.52}
            color="#c1440e"
            surfaceColor="#8b3a0f"
            orbitSpeed={0.053}
            hasAtmosphere
            atmosphereColor="#ffccaa"
            atmosphereThickness={1.05}
            tilt={25.2}
            isPaused={isPaused}
            timeSpeed={timeSpeed}
          />
          
          {/* Asteroids */}
          {asteroids.map((asteroid, index) => (
            <Asteroid3D
              key={asteroid.id}
              asteroid={asteroid}
              index={index}
              isSelected={selectedAsteroid?.id === asteroid.id}
              isHovered={hoveredAsteroid === asteroid.id}
              onSelect={() => onSelectAsteroid(asteroid)}
              onHover={(hover) => setHoveredAsteroid(hover ? asteroid.id : null)}
              isPaused={isPaused}
              timeSpeed={timeSpeed}
              earthOrbitRadius={earthOrbitRadius}
            />
          ))}
          
          <CameraController zoom={zoom} />
        </Suspense>
      </Canvas>

      {/* UI Overlays */}
      <div className="absolute top-2 left-2 z-10">
        <h2 className="font-display text-sm text-white">Orbital Tracking</h2>
        <p className="text-[9px] text-gray-500 tracking-wider">HIGH-FIDELITY 3D NEO MONITOR</p>
      </div>

      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <Button variant="outline" size="icon" onClick={toggleFullscreen}
          className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-cyan-400">
          {isFullscreen ? <Minimize2 className="h-3 w-3 text-white" /> : <Maximize2 className="h-3 w-3 text-white" />}
        </Button>
        <Button variant="outline" size="icon" onClick={() => setZoom(0.6)}
          className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-cyan-400">
          <RotateCcw className="h-3 w-3 text-white" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setZoom(prev => Math.min(prev + 0.25, maxZoom))} disabled={zoom >= maxZoom}
          className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-cyan-400">
          <ZoomIn className="h-3 w-3 text-white" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setZoom(prev => Math.max(prev - 0.25, minZoom))} disabled={zoom <= minZoom}
          className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-cyan-400">
          <ZoomOut className="h-3 w-3 text-white" />
        </Button>
        <div className="text-center text-[8px] text-gray-400 mt-0.5">{Math.round(zoom * 100)}%</div>
      </div>

      {/* Time Controls */}
      <div className="absolute top-14 left-2 z-10 border border-white/20 bg-black/90 p-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Button variant="outline" size="icon" onClick={() => setIsPaused(!isPaused)}
            className="w-5 h-5 bg-black/80 border-white/20 hover:bg-white/10">
            {isPaused ? <Play className="h-2.5 w-2.5 text-green-400" /> : <Pause className="h-2.5 w-2.5 text-amber-400" />}
          </Button>
          <span className="text-[9px] text-cyan-400 font-mono">{getSpeedLabel()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[7px] text-gray-500">S</span>
          <Slider value={[timeSpeed]} onValueChange={(v) => setTimeSpeed(v[0])} min={0.25} max={4} step={0.25} className="w-14" />
          <span className="text-[7px] text-gray-500">F</span>
        </div>
      </div>

      {/* 3D Controls hint */}
      <div className="absolute bottom-14 left-2 z-10 border border-white/20 bg-black/90 p-2">
        <p className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Controls</p>
        <div className="space-y-0.5 text-[7px] text-gray-500">
          <div>🖱️ Drag → Rotate</div>
          <div>⚙️ Scroll → Zoom</div>
          <div>⇧+Drag → Pan</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 border border-white/20 bg-black/90 p-2">
        <p className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Threat Level</p>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[8px] text-gray-400">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[8px] text-gray-400">Med</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[8px] text-gray-400">High</span>
          </div>
        </div>
      </div>

      {/* Asteroid Types Legend */}
      <div className="absolute bottom-2 right-2 border border-white/20 bg-black/90 p-2 z-10">
        <p className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Asteroid Types</p>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8B4513' }} />
            <span className="text-[7px] text-gray-400">S-type (Silicate)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2F4F4F' }} />
            <span className="text-[7px] text-gray-400">C-type (Carbon)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#696969' }} />
            <span className="text-[7px] text-gray-400">X-type (Metallic)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalVisualization;
