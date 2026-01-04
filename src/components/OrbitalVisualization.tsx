import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Sphere, Ring, Line } from '@react-three/drei';
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

  switch (asteroid.id) {
    case '2024-yr4':
      return { ...baseProps, color: '#8B4513', emissiveColor: '#3d2106', type: 'rocky' as const, roughness: 0.95, metalness: 0.05 };
    case 'apophis':
      return { ...baseProps, color: '#CD853F', emissiveColor: '#5a3a1c', type: 'rocky' as const, roughness: 0.85, metalness: 0.15 };
    case '2023-dw':
      return { ...baseProps, color: '#2F4F4F', emissiveColor: '#1a2a2a', type: 'carbonaceous' as const, roughness: 0.98, metalness: 0.02 };
    case '2021-qm1':
      return { ...baseProps, color: '#696969', emissiveColor: '#333333', type: 'metallic' as const, roughness: 0.7, metalness: 0.4 };
    case '2018-vp1':
      return { ...baseProps, color: '#A0522D', emissiveColor: '#4a2515', type: 'rocky' as const, roughness: 0.92, metalness: 0.08 };
    case 'bennu':
      return { ...baseProps, color: '#1C1C1C', emissiveColor: '#0a0a0a', type: 'carbonaceous' as const, roughness: 0.99, metalness: 0.01 };
    default:
      return baseProps;
  }
};

// Generate procedural asteroid geometry
const createAsteroidGeometry = (asteroid: Asteroid, seed: number) => {
  const size = Math.max(0.12, Math.min(0.6, asteroid.diameter / 150));
  
  let geo: THREE.BufferGeometry;
  const shapeType = seed % 4;
  
  switch (shapeType) {
    case 0: geo = new THREE.IcosahedronGeometry(size, 2); break;
    case 1: geo = new THREE.DodecahedronGeometry(size, 1); break;
    case 2: geo = new THREE.OctahedronGeometry(size, 2); break;
    default: geo = new THREE.SphereGeometry(size, 16, 12);
  }

  const positions = geo.attributes.position.array as Float32Array;
  const random = mulberry32(seed);
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const noise1 = (random() - 0.5) * 0.35;
    const noise2 = (random() - 0.5) * 0.2;
    const noise3 = (random() - 0.5) * 0.15;
    
    positions[i] *= 1 + noise1 + Math.sin(y * 5) * 0.1;
    positions[i + 1] *= 1 + noise2 * 0.7 + Math.cos(x * 4) * 0.08;
    positions[i + 2] *= 1 + noise3 + Math.sin(x * y * 3) * 0.12;
  }
  
  geo.computeVertexNormals();
  return { geometry: geo, size };
};

const mulberry32 = (a: number) => {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

// Configure texture for proper spherical mapping
const configureTexture = (texture: THREE.Texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
};

// Textured Sun with corona
const TexturedSun = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const sunTexture = useLoader(THREE.TextureLoader, '/textures/sun.jpg');
  
  useMemo(() => configureTexture(sunTexture), [sunTexture]);
  
  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y += 0.0003;
    if (coronaRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.06;
      coronaRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>
      <Sphere args={[2.8, 48, 48]}>
        <meshBasicMaterial color="#FF8C00" transparent opacity={0.4} />
      </Sphere>
      <Sphere ref={coronaRef} args={[3.3, 32, 32]}>
        <meshBasicMaterial color="#FFD700" transparent opacity={0.2} />
      </Sphere>
      <Sphere args={[4.2, 32, 32]}>
        <meshBasicMaterial color="#FFF8DC" transparent opacity={0.08} />
      </Sphere>
      <pointLight intensity={8} distance={300} decay={1.5} color="#FFF5E0" />
      <Html position={[0, -3.8, 0]} center>
        <span className="text-[10px] text-amber-400 font-mono tracking-widest font-bold">☉ SUN</span>
      </Html>
    </group>
  );
};

// Textured Mercury
const TexturedMercury = ({ orbitRadius, isPaused, timeSpeed }: { orbitRadius: number; isPaused: boolean; timeSpeed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  const mercuryTexture = useLoader(THREE.TextureLoader, '/textures/mercury.jpg');

  useMemo(() => configureTexture(mercuryTexture), [mercuryTexture]);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    if (meshRef.current) meshRef.current.rotation.y += 0.002 * speed;
    if (groupRef.current) {
      setAngle(prev => prev + delta * 0.415 * speed);
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  return (
    <>
      <Ring args={[orbitRadius - 0.03, orbitRadius + 0.03, 128]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#8c8c8c" transparent opacity={0.12} side={THREE.DoubleSide} />
      </Ring>
      <group ref={groupRef}>
        <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
          <sphereGeometry args={[0.25, 64, 64]} />
          <meshStandardMaterial map={mercuryTexture} roughness={0.9} metalness={0.1} />
        </mesh>
        <Html position={[0, -0.5, 0]} center>
          <span className="text-[7px] text-gray-500 font-mono">MERCURY</span>
        </Html>
      </group>
    </>
  );
};

// Textured Venus with atmosphere
const TexturedVenus = ({ orbitRadius, isPaused, timeSpeed }: { orbitRadius: number; isPaused: boolean; timeSpeed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  const venusTexture = useLoader(THREE.TextureLoader, '/textures/venus.jpg');
  const venusAtmosphere = useLoader(THREE.TextureLoader, '/textures/venus_atmosphere.jpg');

  useMemo(() => {
    configureTexture(venusTexture);
    configureTexture(venusAtmosphere);
  }, [venusTexture, venusAtmosphere]);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    if (meshRef.current) meshRef.current.rotation.y -= 0.001 * speed;
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += 0.003 * speed;
    if (groupRef.current) {
      setAngle(prev => prev + delta * 0.162 * speed);
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  return (
    <>
      <Ring args={[orbitRadius - 0.04, orbitRadius + 0.04, 128]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#e6c87a" transparent opacity={0.12} side={THREE.DoubleSide} />
      </Ring>
      <group ref={groupRef}>
        <group rotation={[177.4 * Math.PI / 180, 0, 0]}>
          <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[0.55, 64, 64]} />
            <meshStandardMaterial map={venusTexture} roughness={0.8} metalness={0.1} />
          </mesh>
          <mesh ref={atmosphereRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[0.62, 48, 48]} />
            <meshStandardMaterial map={venusAtmosphere} transparent opacity={0.7} roughness={1} />
          </mesh>
          <Sphere args={[0.68, 32, 32]}>
            <meshBasicMaterial color="#fff5d4" transparent opacity={0.15} />
          </Sphere>
        </group>
        <Html position={[0, -0.85, 0]} center>
          <span className="text-[7px] text-amber-300 font-mono">VENUS</span>
        </Html>
      </group>
    </>
  );
};

// High-fidelity textured Earth with clouds and Moon
const TexturedEarth = ({ orbitRadius, isPaused, timeSpeed }: { orbitRadius: number; isPaused: boolean; timeSpeed: number }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(0);
  const [moonAngle, setMoonAngle] = useState(0);
  
  const earthTexture = useLoader(THREE.TextureLoader, '/textures/earth_daymap.jpg');
  const cloudsTexture = useLoader(THREE.TextureLoader, '/textures/earth_clouds.jpg');
  const moonTexture = useLoader(THREE.TextureLoader, '/textures/moon.jpg');

  useMemo(() => {
    configureTexture(earthTexture);
    configureTexture(cloudsTexture);
    configureTexture(moonTexture);
  }, [earthTexture, cloudsTexture, moonTexture]);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    
    if (earthRef.current) earthRef.current.rotation.y += 0.003 * speed;
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.004 * speed;
    }
    if (moonRef.current) moonRef.current.rotation.y += 0.001 * speed;
    if (groupRef.current) {
      setAngle(prev => prev + delta * 0.1 * speed);
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
    if (moonGroupRef.current) {
      setMoonAngle(prev => prev + delta * 0.35 * speed);
      moonGroupRef.current.position.x = Math.cos(moonAngle) * 1.8;
      moonGroupRef.current.position.z = Math.sin(moonAngle) * 1.8;
      moonGroupRef.current.position.y = Math.sin(moonAngle * 0.5) * 0.15;
    }
  });

  return (
    <>
      <Ring args={[orbitRadius - 0.05, orbitRadius + 0.05, 256]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.18} side={THREE.DoubleSide} />
      </Ring>
      
      <group ref={groupRef}>
        <group rotation={[23.5 * Math.PI / 180, 0, 0]}>
          {/* Earth surface */}
          <mesh ref={earthRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[0.7, 64, 64]} />
            <meshStandardMaterial 
              map={earthTexture}
              roughness={0.65}
              metalness={0.1}
            />
          </mesh>
          
          {/* Cloud layer */}
          <mesh ref={cloudsRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[0.72, 48, 48]} />
            <meshStandardMaterial 
              map={cloudsTexture}
              transparent
              opacity={0.45}
              depthWrite={false}
            />
          </mesh>
          
          {/* Atmosphere glow */}
          <Sphere args={[0.78, 32, 32]}>
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.18} />
          </Sphere>
          <Sphere args={[0.85, 32, 32]}>
            <meshBasicMaterial color="#93c5fd" transparent opacity={0.08} />
          </Sphere>
        </group>
        
        {/* Moon orbit */}
        <Ring args={[1.75, 1.85, 64]} rotation={[-Math.PI / 2 + 0.09, 0, 0]}>
          <meshBasicMaterial color="#6b7280" transparent opacity={0.08} side={THREE.DoubleSide} />
        </Ring>
        
        {/* Textured Moon */}
        <group ref={moonGroupRef}>
          <mesh ref={moonRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[0.18, 32, 32]} />
            <meshStandardMaterial 
              map={moonTexture}
              roughness={1}
              metalness={0}
            />
          </mesh>
          <Html position={[0, -0.35, 0]} center>
            <span className="text-[6px] text-gray-500 font-mono">MOON</span>
          </Html>
        </group>
        
        <Html position={[0, -1.3, 0]} center>
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest font-bold">🌍 EARTH</span>
        </Html>
      </group>
    </>
  );
};

// Textured Mars
const TexturedMars = ({ orbitRadius, isPaused, timeSpeed }: { orbitRadius: number; isPaused: boolean; timeSpeed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  const marsTexture = useLoader(THREE.TextureLoader, '/textures/mars.jpg');

  useMemo(() => configureTexture(marsTexture), [marsTexture]);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    if (meshRef.current) meshRef.current.rotation.y += 0.003 * speed;
    if (groupRef.current) {
      setAngle(prev => prev + delta * 0.053 * speed);
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  return (
    <>
      <Ring args={[orbitRadius - 0.04, orbitRadius + 0.04, 128]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#c1440e" transparent opacity={0.1} side={THREE.DoubleSide} />
      </Ring>
      <group ref={groupRef}>
        <group rotation={[25.2 * Math.PI / 180, 0, 0]}>
          <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[0.4, 64, 64]} />
            <meshStandardMaterial map={marsTexture} roughness={0.85} metalness={0.1} />
          </mesh>
          {/* Thin atmosphere */}
          <Sphere args={[0.43, 32, 32]}>
            <meshBasicMaterial color="#ffccaa" transparent opacity={0.06} />
          </Sphere>
        </group>
        <Html position={[0, -0.65, 0]} center>
          <span className="text-[7px] text-red-400 font-mono">MARS</span>
        </Html>
      </group>
    </>
  );
};

// Asteroid with detailed info
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
  const [angle, setAngle] = useState(index * 1.2 + Math.random() * 0.5);
  
  // Use real semi-major axis from asteroid data
  const semiMajorAxis = asteroid.semiMajorAxis * earthOrbitRadius;
  const eccentricity = asteroid.eccentricity;
  const inclination = (asteroid.inclination * Math.PI) / 180; // Convert to radians
  const orbitSpeed = 0.1 / asteroid.orbitalPeriod;
  
  const asteroidProps = useMemo(() => getAsteroidProperties(asteroid), [asteroid]);
  const { geometry, size } = useMemo(() => createAsteroidGeometry(asteroid, index * 12345 + asteroid.diameter), [asteroid, index]);
  
  const threatLevel = asteroid.torinoScale >= 3 ? 'high' : asteroid.torinoScale >= 1 ? 'medium' : 'low';
  const threatColor = threatLevel === 'high' ? '#ef4444' : threatLevel === 'medium' ? '#f59e0b' : '#22c55e';

  // Generate elliptical orbit path points
  const orbitPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      // Elliptical orbit using semi-major axis and eccentricity
      const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(theta));
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      // Apply inclination
      const y = z * Math.sin(inclination);
      const zInclined = z * Math.cos(inclination);
      points.push([x, y, zInclined]);
    }
    return points;
  }, [semiMajorAxis, eccentricity, inclination]);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    if (groupRef.current) {
      setAngle(prev => prev + delta * orbitSpeed * speed);
      // Calculate position on elliptical orbit
      const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(angle));
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      // Apply inclination
      groupRef.current.position.x = x;
      groupRef.current.position.y = z * Math.sin(inclination);
      groupRef.current.position.z = z * Math.cos(inclination);
    }
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.008 * speed;
      meshRef.current.rotation.y += 0.012 * speed;
      meshRef.current.rotation.z += 0.005 * speed;
    }
  });

  return (
    <>
      {/* Elliptical orbit path */}
      <Line 
        points={orbitPoints} 
        color={isSelected ? threatColor : asteroidProps.color} 
        transparent 
        opacity={isSelected ? 0.4 : 0.12}
        lineWidth={1}
      />
      
      <group ref={groupRef}>
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
        
        {(isSelected || isHovered) && (
          <Html position={[0, -size - 0.6, 0]} center>
            <div className="bg-black/95 border px-2 py-1.5 min-w-[110px]" style={{ borderColor: threatColor }}>
              <div className="text-[10px] font-mono font-bold mb-0.5" style={{ color: threatColor }}>{asteroid.name}</div>
              <div className="text-[8px] text-gray-400 space-y-0.5">
                <div className="flex justify-between gap-3"><span>Diameter:</span><span className="text-white">{asteroid.diameter}m</span></div>
                <div className="flex justify-between gap-3"><span>Orbit:</span><span className="text-white">{semiMajorAxis.toFixed(2)} AU</span></div>
                <div className="flex justify-between gap-3"><span>Period:</span><span className="text-white">{asteroid.orbitalPeriod.toFixed(2)}y</span></div>
                <div className="flex justify-between gap-3"><span>Velocity:</span><span className="text-white">{asteroid.velocity} km/s</span></div>
                <div className="flex justify-between gap-3"><span>Torino:</span><span style={{ color: threatColor }}>{asteroid.torinoScale}</span></div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
};

const CameraController = ({ zoom }: { zoom: number }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const distance = 35 / zoom;
    camera.position.set(0, distance * 0.7, distance);
    camera.lookAt(0, 0, 0);
  }, [zoom, camera]);

  return <OrbitControls enablePan enableZoom enableRotate minDistance={5} maxDistance={100} zoomSpeed={0.8} rotateSpeed={0.5} />;
};

// Loading fallback
const LoadingFallback = () => (
  <Html center>
    <div className="text-cyan-400 font-mono text-sm animate-pulse">Loading textures...</div>
  </Html>
);

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

  const getSpeedLabel = () => isPaused ? 'PAUSED' : `${timeSpeed}×`;

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
      className={`relative w-full h-full overflow-hidden bg-[#010108] border border-border transition-all duration-300 ${
        isFullscreen ? 'min-h-screen' : 'min-h-[300px]'
      }`}
    >
      <Canvas camera={{ position: [0, 20, 40], fov: 50 }} dpr={[1, 2]}>
        <Suspense fallback={<LoadingFallback />}>
          <color attach="background" args={['#010108']} />
          <fog attach="fog" args={['#010108', 60, 180]} />
          
          <ambientLight intensity={0.8} />
          <directionalLight position={[50, 30, 50]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-30, -20, -30]} intensity={0.4} color="#4a90d9" />
          
          <Stars radius={250} depth={120} count={10000} factor={5} saturation={0.15} fade speed={0.2} />
          
          <TexturedSun />
          <TexturedMercury orbitRadius={earthOrbitRadius * 0.39} isPaused={isPaused} timeSpeed={timeSpeed} />
          <TexturedVenus orbitRadius={earthOrbitRadius * 0.72} isPaused={isPaused} timeSpeed={timeSpeed} />
          <TexturedEarth orbitRadius={earthOrbitRadius} isPaused={isPaused} timeSpeed={timeSpeed} />
          <TexturedMars orbitRadius={earthOrbitRadius * 1.52} isPaused={isPaused} timeSpeed={timeSpeed} />
          
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
        <p className="text-[9px] text-gray-500 tracking-wider">NASA TEXTURED 3D MODEL</p>
      </div>

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

      <div className="absolute bottom-14 left-2 z-10 border border-white/20 bg-black/90 p-2">
        <p className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Controls</p>
        <div className="space-y-0.5 text-[7px] text-gray-500">
          <div>🖱️ Drag → Rotate</div>
          <div>⚙️ Scroll → Zoom</div>
          <div>⇧+Drag → Pan</div>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 border border-white/20 bg-black/90 p-2">
        <p className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Threat Level</p>
        <div className="flex gap-2">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[8px] text-gray-400">Low</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[8px] text-gray-400">Med</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[8px] text-gray-400">High</span></div>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 border border-white/20 bg-black/90 p-2 z-10">
        <p className="text-[8px] text-gray-500 uppercase tracking-wider mb-1">Asteroid Types</p>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8B4513' }} /><span className="text-[7px] text-gray-400">S-type (Silicate)</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2F4F4F' }} /><span className="text-[7px] text-gray-400">C-type (Carbon)</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#696969' }} /><span className="text-[7px] text-gray-400">X-type (Metallic)</span></div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalVisualization;
