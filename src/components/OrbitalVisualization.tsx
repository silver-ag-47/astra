import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Sphere, Ring, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Asteroid, asteroids } from '@/data/asteroids';
import { ZoomIn, ZoomOut, Play, Pause, Maximize2, Minimize2, RotateCcw, Rewind, FastForward, SkipBack, SkipForward, Target, ChevronDown, Home, Eye, Crosshair, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import ImpactSimulation from './ImpactSimulation';
import DamageAssessmentOverlay from './DamageAssessmentOverlay';
import DefenseComparisonModal from './DefenseComparisonModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrbitalVisualizationProps {
  selectedAsteroid: Asteroid | null;
  onSelectAsteroid: (asteroid: Asteroid) => void;
  customAsteroids?: Asteroid[];
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
const TexturedEarth = ({ 
  orbitRadius, 
  isPaused, 
  timeSpeed,
  onPositionUpdate 
}: { 
  orbitRadius: number; 
  isPaused: boolean; 
  timeSpeed: number;
  onPositionUpdate?: (position: THREE.Vector3) => void;
}) => {
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
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      groupRef.current.position.x = x;
      groupRef.current.position.z = z;
      
      // Report Earth position for impact simulation
      if (onPositionUpdate) {
        onPositionUpdate(new THREE.Vector3(x, 0, z));
      }
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

// Asteroid Belt between Mars and Jupiter
const AsteroidBelt = ({ 
  earthOrbitRadius, 
  isPaused, 
  timeSpeed 
}: { 
  earthOrbitRadius: number; 
  isPaused: boolean; 
  timeSpeed: number 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const asteroidCount = 3000;
  
  // Belt parameters (between Mars at 1.52 AU and Jupiter at 5.2 AU)
  const innerRadius = earthOrbitRadius * 2.1;
  const outerRadius = earthOrbitRadius * 3.3;
  
  // Generate asteroid data once
  const asteroidData = useMemo(() => {
    const data: { 
      position: THREE.Vector3; 
      rotation: THREE.Euler; 
      scale: number; 
      orbitRadius: number; 
      orbitSpeed: number; 
      initialAngle: number;
      inclination: number;
    }[] = [];
    
    const random = mulberry32(42);
    
    for (let i = 0; i < asteroidCount; i++) {
      // Distribute more densely in certain regions (like real belt)
      const radiusT = random();
      const orbitRadius = innerRadius + (outerRadius - innerRadius) * (radiusT * radiusT * 0.6 + radiusT * 0.4);
      
      const initialAngle = random() * Math.PI * 2;
      const inclination = (random() - 0.5) * 0.3; // ±8.5 degrees inclination
      const orbitSpeed = 0.015 / Math.pow(orbitRadius / earthOrbitRadius, 1.5); // Kepler's 3rd law
      
      const x = Math.cos(initialAngle) * orbitRadius;
      const z = Math.sin(initialAngle) * orbitRadius;
      const y = z * Math.sin(inclination);
      
      // Random size (most are small, few are large)
      const sizeRandom = random();
      const scale = 0.02 + sizeRandom * sizeRandom * 0.08;
      
      data.push({
        position: new THREE.Vector3(x, y, z * Math.cos(inclination)),
        rotation: new THREE.Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI),
        scale,
        orbitRadius,
        orbitSpeed,
        initialAngle,
        inclination
      });
    }
    
    return data;
  }, [innerRadius, outerRadius, earthOrbitRadius]);
  
  // Create geometry once
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    // Deform to make it irregular
    const positions = geo.attributes.position.array as Float32Array;
    const random = mulberry32(123);
    for (let i = 0; i < positions.length; i += 3) {
      const noise = 0.7 + random() * 0.6;
      positions[i] *= noise;
      positions[i + 1] *= noise;
      positions[i + 2] *= noise;
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
  
  // Track angles for animation
  const anglesRef = useRef<number[]>(asteroidData.map(d => d.initialAngle));
  
  // Set initial transforms
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();
    
    asteroidData.forEach((asteroid, i) => {
      tempPosition.copy(asteroid.position);
      tempQuaternion.setFromEuler(asteroid.rotation);
      tempScale.set(asteroid.scale, asteroid.scale, asteroid.scale);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      meshRef.current!.setMatrixAt(i, tempMatrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [asteroidData]);
  
  // Animate asteroids
  useFrame((state, delta) => {
    if (!meshRef.current || isPaused) return;
    
    const speed = timeSpeed;
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();
    
    asteroidData.forEach((asteroid, i) => {
      // Update angle
      anglesRef.current[i] += delta * asteroid.orbitSpeed * speed;
      const angle = anglesRef.current[i];
      
      // Calculate new position
      const x = Math.cos(angle) * asteroid.orbitRadius;
      const z = Math.sin(angle) * asteroid.orbitRadius;
      const y = z * Math.sin(asteroid.inclination);
      
      tempPosition.set(x, y, z * Math.cos(asteroid.inclination));
      
      // Slowly rotate the asteroid
      asteroid.rotation.x += delta * 0.1 * speed;
      asteroid.rotation.y += delta * 0.15 * speed;
      
      tempQuaternion.setFromEuler(asteroid.rotation);
      tempScale.set(asteroid.scale, asteroid.scale, asteroid.scale);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      meshRef.current!.setMatrixAt(i, tempMatrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <group>
      {/* Belt boundary rings (subtle) */}
      <Ring args={[innerRadius - 0.05, innerRadius + 0.05, 128]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#4a4a4a" transparent opacity={0.06} side={THREE.DoubleSide} />
      </Ring>
      <Ring args={[outerRadius - 0.05, outerRadius + 0.05, 128]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#4a4a4a" transparent opacity={0.06} side={THREE.DoubleSide} />
      </Ring>
      
      {/* Instanced asteroids */}
      <instancedMesh 
        ref={meshRef} 
        args={[geometry, undefined, asteroidCount]}
        frustumCulled={false}
      >
        <meshStandardMaterial 
          color="#7a7a7a"
          roughness={0.95}
          metalness={0.1}
          flatShading
        />
      </instancedMesh>
    </group>
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

// Textured Jupiter
const TexturedJupiter = ({ orbitRadius, isPaused, timeSpeed }: { orbitRadius: number; isPaused: boolean; timeSpeed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  const jupiterTexture = useLoader(THREE.TextureLoader, '/textures/jupiter.jpg');

  useMemo(() => configureTexture(jupiterTexture), [jupiterTexture]);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    if (meshRef.current) meshRef.current.rotation.y += 0.006 * speed; // Jupiter rotates fast
    if (groupRef.current) {
      setAngle(prev => prev + delta * 0.0084 * speed); // ~11.86 year orbit
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  return (
    <>
      <Ring args={[orbitRadius - 0.08, orbitRadius + 0.08, 256]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#d4a574" transparent opacity={0.08} side={THREE.DoubleSide} />
      </Ring>
      <group ref={groupRef}>
        <group rotation={[3.1 * Math.PI / 180, 0, 0]}>
          <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[1.4, 64, 64]} />
            <meshStandardMaterial map={jupiterTexture} roughness={0.7} metalness={0.1} />
          </mesh>
          {/* Faint atmosphere */}
          <Sphere args={[1.48, 32, 32]}>
            <meshBasicMaterial color="#e8d4b8" transparent opacity={0.08} />
          </Sphere>
        </group>
        <Html position={[0, -1.8, 0]} center>
          <span className="text-[8px] text-orange-300 font-mono">JUPITER</span>
        </Html>
      </group>
    </>
  );
};

// Textured Saturn with rings
const TexturedSaturn = ({ orbitRadius, isPaused, timeSpeed }: { orbitRadius: number; isPaused: boolean; timeSpeed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  const saturnTexture = useLoader(THREE.TextureLoader, '/textures/saturn.jpg');
  const ringTexture = useLoader(THREE.TextureLoader, '/textures/saturn_ring.png');

  useMemo(() => {
    configureTexture(saturnTexture);
    ringTexture.wrapS = THREE.ClampToEdgeWrapping;
    ringTexture.wrapT = THREE.ClampToEdgeWrapping;
  }, [saturnTexture, ringTexture]);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    if (meshRef.current) meshRef.current.rotation.y += 0.005 * speed;
    if (groupRef.current) {
      setAngle(prev => prev + delta * 0.0034 * speed); // ~29.5 year orbit
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  return (
    <>
      <Ring args={[orbitRadius - 0.08, orbitRadius + 0.08, 256]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#e6d5a8" transparent opacity={0.06} side={THREE.DoubleSide} />
      </Ring>
      <group ref={groupRef}>
        <group rotation={[26.7 * Math.PI / 180, 0, 0]}>
          <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[1.1, 64, 64]} />
            <meshStandardMaterial map={saturnTexture} roughness={0.75} metalness={0.1} />
          </mesh>
          {/* Saturn's rings */}
          <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.4, 2.4, 64]} />
            <meshBasicMaterial 
              map={ringTexture} 
              transparent 
              opacity={0.85} 
              side={THREE.DoubleSide}
              color="#f5e6c8"
            />
          </mesh>
          {/* Inner ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.25, 1.38, 64]} />
            <meshBasicMaterial color="#c9b896" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
        <Html position={[0, -2.8, 0]} center>
          <span className="text-[8px] text-yellow-200 font-mono">SATURN</span>
        </Html>
      </group>
    </>
  );
};

// Textured Uranus
const TexturedUranus = ({ orbitRadius, isPaused, timeSpeed }: { orbitRadius: number; isPaused: boolean; timeSpeed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  const uranusTexture = useLoader(THREE.TextureLoader, '/textures/uranus.jpg');

  useMemo(() => configureTexture(uranusTexture), [uranusTexture]);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    if (meshRef.current) meshRef.current.rotation.y -= 0.004 * speed; // Retrograde rotation
    if (groupRef.current) {
      setAngle(prev => prev + delta * 0.0012 * speed); // ~84 year orbit
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  return (
    <>
      <Ring args={[orbitRadius - 0.06, orbitRadius + 0.06, 256]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.05} side={THREE.DoubleSide} />
      </Ring>
      <group ref={groupRef}>
        <group rotation={[97.8 * Math.PI / 180, 0, 0]}> {/* Extreme axial tilt */}
          <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[0.65, 64, 64]} />
            <meshStandardMaterial map={uranusTexture} roughness={0.8} metalness={0.1} />
          </mesh>
          {/* Faint atmosphere */}
          <Sphere args={[0.7, 32, 32]}>
            <meshBasicMaterial color="#a5f3fc" transparent opacity={0.12} />
          </Sphere>
          {/* Faint ring system */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.85, 1.0, 48]} />
            <meshBasicMaterial color="#7dd3fc" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        </group>
        <Html position={[0, -1.2, 0]} center>
          <span className="text-[7px] text-cyan-300 font-mono">URANUS</span>
        </Html>
      </group>
    </>
  );
};

// Textured Neptune
const TexturedNeptune = ({ orbitRadius, isPaused, timeSpeed }: { orbitRadius: number; isPaused: boolean; timeSpeed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  const neptuneTexture = useLoader(THREE.TextureLoader, '/textures/neptune.jpg');

  useMemo(() => configureTexture(neptuneTexture), [neptuneTexture]);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    if (meshRef.current) meshRef.current.rotation.y += 0.005 * speed;
    if (groupRef.current) {
      setAngle(prev => prev + delta * 0.0006 * speed); // ~165 year orbit
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
  });

  return (
    <>
      <Ring args={[orbitRadius - 0.06, orbitRadius + 0.06, 256]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} side={THREE.DoubleSide} />
      </Ring>
      <group ref={groupRef}>
        <group rotation={[28.3 * Math.PI / 180, 0, 0]}>
          <mesh ref={meshRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[0.6, 64, 64]} />
            <meshStandardMaterial map={neptuneTexture} roughness={0.8} metalness={0.1} />
          </mesh>
          {/* Atmosphere */}
          <Sphere args={[0.65, 32, 32]}>
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.15} />
          </Sphere>
        </group>
        <Html position={[0, -1.0, 0]} center>
          <span className="text-[7px] text-blue-400 font-mono">NEPTUNE</span>
        </Html>
      </group>
    </>
  );
};

// Pulsing tracking indicator for overview mode
const TrackingIndicator = ({ size, color }: { size: number; color: string }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const pulse = 0.8 + Math.sin(time * 3) * 0.2;
    const outerPulse = 0.7 + Math.sin(time * 2) * 0.3;
    
    if (ringRef.current) {
      ringRef.current.scale.set(pulse, pulse, pulse);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(time * 4) * 0.2;
    }
    if (outerRingRef.current) {
      outerRingRef.current.scale.set(outerPulse, outerPulse, outerPulse);
      outerRingRef.current.rotation.z = time * 0.5;
      (outerRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(time * 3) * 0.1;
    }
  });

  return (
    <group>
      {/* Inner pulsing ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 2.5, size * 2.8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Outer rotating ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 3.5, size * 3.7, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Tracking crosshairs */}
      <Line 
        points={[[0, 0, -size * 4], [0, 0, size * 4]]} 
        color={color} 
        transparent 
        opacity={0.3}
        lineWidth={1}
      />
      <Line 
        points={[[-size * 4, 0, 0], [size * 4, 0, 0]]} 
        color={color} 
        transparent 
        opacity={0.3}
        lineWidth={1}
      />
      
      {/* Tracking label */}
      <Html position={[0, size * 4, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="text-[8px] font-mono text-amber-400 bg-black/60 px-1.5 py-0.5 border border-amber-500/50 animate-pulse">
          TRACKING
        </div>
      </Html>
    </group>
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
  earthOrbitRadius,
  isTrackedInOverview,
  isCustom = false
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
  isTrackedInOverview: boolean;
  isCustom?: boolean;
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
  const customColor = '#a855f7'; // Purple for custom asteroids

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
      const posX = x;
      const posY = z * Math.sin(inclination);
      const posZ = z * Math.cos(inclination);
      
      groupRef.current.position.x = posX;
      groupRef.current.position.y = posY;
      groupRef.current.position.z = posZ;
      
      // Store position for camera focus
      asteroidPositions.set(asteroid.id, new THREE.Vector3(posX, posY, posZ));
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
        color={isCustom ? customColor : isSelected ? threatColor : asteroidProps.color} 
        transparent 
        opacity={isSelected ? 0.4 : isCustom ? 0.25 : 0.12}
        lineWidth={isCustom ? 1.5 : 1}
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
        
        {/* Pulsing tracking indicator in overview mode */}
        {isTrackedInOverview && (
          <TrackingIndicator size={size} color={threatColor} />
        )}
        
        {(isSelected || isHovered) && (
          <Html position={[0, -size - 0.8, 0]} center style={{ pointerEvents: 'none' }} zIndexRange={[0, 0]}>
            <div className="bg-black/60 backdrop-blur-sm border px-2 py-1.5 min-w-[110px] pointer-events-none" style={{ borderColor: threatColor }}>
              <div className="text-[10px] font-mono font-bold mb-0.5" style={{ color: threatColor }}>{asteroid.name}</div>
              <div className="text-[8px] text-gray-400 space-y-0.5">
                <div className="flex justify-between gap-3"><span>Diameter:</span><span className="text-white/90">{asteroid.diameter}m</span></div>
                <div className="flex justify-between gap-3"><span>Orbit:</span><span className="text-white/90">{semiMajorAxis.toFixed(2)} AU</span></div>
                <div className="flex justify-between gap-3"><span>Period:</span><span className="text-white/90">{asteroid.orbitalPeriod.toFixed(2)}y</span></div>
                <div className="flex justify-between gap-3"><span>Velocity:</span><span className="text-white/90">{asteroid.velocity} km/s</span></div>
                <div className="flex justify-between gap-3"><span>Torino:</span><span style={{ color: threatColor }}>{asteroid.torinoScale}</span></div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </>
  );
};

// Comet with glowing tail
const Comet = ({ 
  isPaused, 
  timeSpeed,
  earthOrbitRadius 
}: { 
  isPaused: boolean; 
  timeSpeed: number;
  earthOrbitRadius: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const [angle, setAngle] = useState(0);
  
  // Highly elliptical comet orbit (like Halley's comet)
  const semiMajorAxis = earthOrbitRadius * 2.8;
  const eccentricity = 0.85;
  const inclination = 25 * Math.PI / 180;
  const orbitSpeed = 0.02;

  // Generate comet orbit path
  const orbitPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const segments = 256;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(theta));
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      const y = z * Math.sin(inclination);
      const zInclined = z * Math.cos(inclination);
      points.push([x, y, zInclined]);
    }
    return points;
  }, [semiMajorAxis, eccentricity, inclination]);

  // Create tail geometry
  const tailGeometry = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.5, 0.2, 0),
      new THREE.Vector3(4, 0.5, 0)
    );
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.15, 8, false);
    return tubeGeo;
  }, []);

  // Create dust tail geometry (wider, slightly different direction)
  const dustTailGeometry = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.2, -0.1, 0.3),
      new THREE.Vector3(3, -0.3, 0.8)
    );
    return new THREE.TubeGeometry(curve, 24, 0.25, 8, false);
  }, []);

  useFrame((state, delta) => {
    const speed = isPaused ? 0 : timeSpeed;
    
    if (groupRef.current) {
      setAngle(prev => prev + delta * orbitSpeed * speed);
      
      // Calculate position on elliptical orbit
      const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(angle));
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const y = z * Math.sin(inclination);
      const zInclined = z * Math.cos(inclination);
      
      groupRef.current.position.set(x, y, zInclined);
      
      // Point tail away from sun (opposite direction of position)
      const tailAngle = Math.atan2(zInclined, x);
      groupRef.current.rotation.y = tailAngle;
      
      // Tail length and intensity based on distance from sun
      const distanceFromSun = Math.sqrt(x * x + y * y + zInclined * zInclined);
      const tailScale = Math.max(0.3, Math.min(2.5, 8 / distanceFromSun));
      
      if (tailRef.current) {
        tailRef.current.scale.x = tailScale;
        tailRef.current.scale.y = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      }
    }
    
    if (nucleusRef.current) {
      nucleusRef.current.rotation.x += 0.02 * speed;
      nucleusRef.current.rotation.y += 0.03 * speed;
    }
  });

  return (
    <>
      {/* Comet orbit path */}
      <Line 
        points={orbitPoints} 
        color="#00ffff" 
        transparent 
        opacity={0.15}
        lineWidth={1}
        dashed
        dashSize={0.5}
        gapSize={0.3}
      />
      
      <group ref={groupRef}>
        {/* Nucleus (irregular rocky/icy body) */}
        <mesh ref={nucleusRef}>
          <dodecahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial 
            color="#2a2a3a"
            roughness={0.95}
            metalness={0.05}
            emissive="#1a1a2a"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Coma (gas cloud around nucleus) */}
        <Sphere args={[0.35, 24, 24]}>
          <meshBasicMaterial 
            color="#88ccff" 
            transparent 
            opacity={0.25}
          />
        </Sphere>
        <Sphere args={[0.5, 16, 16]}>
          <meshBasicMaterial 
            color="#aaddff" 
            transparent 
            opacity={0.12}
          />
        </Sphere>
        
        {/* Ion tail (blue, straight, points directly away from sun) */}
        <mesh ref={tailRef} geometry={tailGeometry}>
          <meshBasicMaterial 
            color="#00ccff" 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Ion tail glow */}
        <mesh geometry={tailGeometry} scale={[1, 1.5, 1.5]}>
          <meshBasicMaterial 
            color="#00aaff" 
            transparent 
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Dust tail (yellowish, curved) */}
        <mesh geometry={dustTailGeometry}>
          <meshBasicMaterial 
            color="#ffeeaa" 
            transparent 
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Bright point at nucleus */}
        <pointLight intensity={0.5} distance={3} color="#88ccff" />
        
        {/* Label */}
        <Html position={[0, -0.8, 0]} center>
          <span className="text-[7px] text-cyan-300 font-mono whitespace-nowrap">☄️ COMET</span>
        </Html>
      </group>
    </>
  );
};

// Store asteroid positions for camera focus
const asteroidPositions = new Map<string, THREE.Vector3>();

const CameraController = ({ 
  zoom, 
  focusTarget 
}: { 
  zoom: number; 
  focusTarget: Asteroid | null;
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);
  const animationProgress = useRef(0);
  const startCameraPos = useRef(new THREE.Vector3());
  const endCameraPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());
  
  // Trigger animation when focus target changes
  useEffect(() => {
    if (focusTarget) {
      const asteroidPos = asteroidPositions.get(focusTarget.id);
      if (asteroidPos) {
        isAnimating.current = true;
        animationProgress.current = 0;
        startCameraPos.current.copy(camera.position);
        startTarget.current.copy(targetPosition.current);
        
        // Calculate end position - offset from asteroid
        const distance = 8;
        endCameraPos.current.set(
          asteroidPos.x + distance * 0.5,
          asteroidPos.y + distance * 0.4,
          asteroidPos.z + distance
        );
        endTarget.current.copy(asteroidPos);
      }
    } else {
      // Reset to default view
      isAnimating.current = true;
      animationProgress.current = 0;
      startCameraPos.current.copy(camera.position);
      startTarget.current.copy(targetPosition.current);
      
      const distance = 35 / zoom;
      endCameraPos.current.set(0, distance * 0.7, distance);
      endTarget.current.set(0, 0, 0);
    }
  }, [focusTarget, camera, zoom]);
  
  // Default zoom behavior (only when not focused)
  useEffect(() => {
    if (!focusTarget && !isAnimating.current) {
      const distance = 35 / zoom;
      camera.position.set(0, distance * 0.7, distance);
      camera.lookAt(0, 0, 0);
    }
  }, [zoom, camera, focusTarget]);
  
  // Animate camera
  useFrame((state, delta) => {
    if (isAnimating.current) {
      animationProgress.current += delta * 1.5; // Animation speed
      const t = Math.min(animationProgress.current, 1);
      // Smooth easing
      const eased = 1 - Math.pow(1 - t, 3);
      
      camera.position.lerpVectors(startCameraPos.current, endCameraPos.current, eased);
      targetPosition.current.lerpVectors(startTarget.current, endTarget.current, eased);
      camera.lookAt(targetPosition.current);
      
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetPosition.current);
      }
      
      if (t >= 1) {
        isAnimating.current = false;
      }
    }
    
    // Follow focused asteroid
    if (focusTarget && !isAnimating.current) {
      const asteroidPos = asteroidPositions.get(focusTarget.id);
      if (asteroidPos) {
        // Smoothly follow the asteroid
        targetPosition.current.lerp(asteroidPos, delta * 2);
        
        const distance = 8;
        const idealCamPos = new THREE.Vector3(
          asteroidPos.x + distance * 0.5,
          asteroidPos.y + distance * 0.4,
          asteroidPos.z + distance
        );
        camera.position.lerp(idealCamPos, delta * 1.5);
        camera.lookAt(targetPosition.current);
        
        if (controlsRef.current) {
          controlsRef.current.target.copy(targetPosition.current);
        }
      }
    }
  });

  return <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate minDistance={5} maxDistance={100} zoomSpeed={0.8} rotateSpeed={0.5} />;
};

// Loading fallback
const LoadingFallback = () => (
  <Html center>
    <div className="text-cyan-400 font-mono text-sm animate-pulse">Loading textures...</div>
  </Html>
);

const OrbitalVisualization = ({ selectedAsteroid, onSelectAsteroid, customAsteroids = [] }: OrbitalVisualizationProps) => {
  const [hoveredAsteroid, setHoveredAsteroid] = useState<string | null>(null);
  
  // Combine default and custom asteroids
  const allAsteroids = useMemo(() => [...asteroids, ...customAsteroids], [customAsteroids]);
  const [zoom, setZoom] = useState(0.6);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [overviewMode, setOverviewMode] = useState(false);
  const [isSimulatingImpact, setIsSimulatingImpact] = useState(false);
  const [showDamageAssessment, setShowDamageAssessment] = useState(false);
  const [showDefenseComparison, setShowDefenseComparison] = useState(false);
  const [earthPosition, setEarthPosition] = useState(new THREE.Vector3(10, 0, 0));
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
      style={{ isolation: 'isolate' }}
    >
      <Canvas camera={{ position: [0, 20, 40], fov: 50 }} dpr={[1, 2]}>
        <Suspense fallback={<LoadingFallback />}>
          <color attach="background" args={['#010108']} />
          <fog attach="fog" args={['#010108', 100, 400]} />
          
          <ambientLight intensity={0.8} />
          <directionalLight position={[50, 30, 50]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-30, -20, -30]} intensity={0.4} color="#4a90d9" />
          
          <Stars radius={400} depth={200} count={15000} factor={6} saturation={0.15} fade speed={0.2} />
          
          <TexturedSun />
          <TexturedMercury orbitRadius={earthOrbitRadius * 0.39} isPaused={isPaused} timeSpeed={timeSpeed} />
          <TexturedVenus orbitRadius={earthOrbitRadius * 0.72} isPaused={isPaused} timeSpeed={timeSpeed} />
          <TexturedEarth 
            orbitRadius={earthOrbitRadius} 
            isPaused={isPaused || isSimulatingImpact} 
            timeSpeed={timeSpeed}
            onPositionUpdate={setEarthPosition}
          />
          <TexturedMars orbitRadius={earthOrbitRadius * 1.52} isPaused={isPaused} timeSpeed={timeSpeed} />
          <AsteroidBelt earthOrbitRadius={earthOrbitRadius} isPaused={isPaused} timeSpeed={timeSpeed} />
          <TexturedJupiter orbitRadius={earthOrbitRadius * 5.2} isPaused={isPaused} timeSpeed={timeSpeed} />
          <TexturedSaturn orbitRadius={earthOrbitRadius * 9.5} isPaused={isPaused} timeSpeed={timeSpeed} />
          <TexturedUranus orbitRadius={earthOrbitRadius * 19.2} isPaused={isPaused} timeSpeed={timeSpeed} />
          <TexturedNeptune orbitRadius={earthOrbitRadius * 30} isPaused={isPaused} timeSpeed={timeSpeed} />
          <Comet isPaused={isPaused} timeSpeed={timeSpeed} earthOrbitRadius={earthOrbitRadius} />
          
          {allAsteroids.map((asteroid, index) => (
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
              isTrackedInOverview={overviewMode && selectedAsteroid?.id === asteroid.id}
              isCustom={asteroid.isCustom}
            />
          ))}
          
          {/* Impact Simulation */}
          {isSimulatingImpact && selectedAsteroid && (
            <ImpactSimulation
              asteroid={selectedAsteroid}
              earthPosition={earthPosition}
              onComplete={() => setIsSimulatingImpact(false)}
              onShowDamageAssessment={() => setShowDamageAssessment(true)}
            />
          )}
          
          <CameraController zoom={zoom} focusTarget={overviewMode ? null : selectedAsteroid} />
        </Suspense>
      </Canvas>

      {/* UI Overlays */}
      <div className="absolute top-2 left-2 z-[100] pointer-events-auto">
        <h2 className="font-display text-sm text-white">Orbital Tracking</h2>
        <p className="text-[9px] text-gray-500 tracking-wider">NASA TEXTURED 3D MODEL</p>
      </div>

      {/* Top Right Controls - Stacked in a column */}
      <div className="absolute top-2 right-2 z-[100] pointer-events-auto flex gap-2" style={{ pointerEvents: 'auto' }}>
        {/* Time Control */}
        <div className="border border-white/20 bg-black/90 p-3 pointer-events-auto">
          <p className="text-[8px] text-gray-500 uppercase tracking-wider mb-2">Time Control</p>
          
          {/* Main playback controls */}
          <div className="flex items-center gap-1 mb-2">
            <Button variant="outline" size="icon" onClick={() => setTimeSpeed(0.25)}
              className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-cyan-400">
              <SkipBack className="h-3 w-3 text-white" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setTimeSpeed(prev => Math.max(0.25, prev - 0.25))}
              className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-cyan-400">
              <Rewind className="h-3 w-3 text-white" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsPaused(!isPaused)}
              className={`w-8 h-8 border-2 hover:bg-white/10 ${isPaused ? 'border-green-500 bg-green-500/10' : 'border-amber-500 bg-amber-500/10'}`}>
              {isPaused ? <Play className="h-4 w-4 text-green-400" /> : <Pause className="h-4 w-4 text-amber-400" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setTimeSpeed(prev => Math.min(8, prev + 0.25))}
              className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-cyan-400">
              <FastForward className="h-3 w-3 text-white" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setTimeSpeed(8)}
              className="w-6 h-6 bg-black/80 border-white/20 hover:bg-white/10 hover:border-cyan-400">
              <SkipForward className="h-3 w-3 text-white" />
            </Button>
          </div>

          {/* Speed indicator */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`text-sm font-mono font-bold ${isPaused ? 'text-amber-400' : 'text-cyan-400'}`}>
              {isPaused ? '⏸ PAUSED' : `▶ ${timeSpeed}×`}
            </span>
          </div>

          {/* Speed slider */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[8px] text-gray-500">0.25×</span>
            <Slider 
              value={[timeSpeed]} 
              onValueChange={(v) => setTimeSpeed(v[0])} 
              min={0.25} 
              max={8} 
              step={0.25} 
              className="w-20"
            />
            <span className="text-[8px] text-gray-500">8×</span>
          </div>

          {/* Speed presets */}
          <div className="flex gap-1">
            {[0.5, 1, 2, 4].map(speed => (
              <Button 
                key={speed}
                variant="outline" 
                size="sm"
                onClick={() => { setTimeSpeed(speed); setIsPaused(false); }}
                className={`h-5 px-2 text-[9px] font-mono ${
                  timeSpeed === speed && !isPaused
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' 
                    : 'bg-black/80 border-white/20 text-gray-400 hover:bg-white/10 hover:border-cyan-400'
                }`}
              >
                {speed}×
              </Button>
            ))}
          </div>
        </div>

        {/* Asteroid Selector */}
        <div className="border border-white/20 bg-black/90 p-2 pointer-events-auto">
          <p className="text-[8px] text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Target className="w-3 h-3" /> Track Asteroid
          </p>
          <Select 
            value={selectedAsteroid?.id || ''} 
            onValueChange={(id) => {
              if (id === 'none') {
                onSelectAsteroid(null as any);
              } else {
                const asteroid = asteroids.find(a => a.id === id);
                if (asteroid) onSelectAsteroid(asteroid);
              }
            }}
          >
            <SelectTrigger className="w-40 h-7 bg-black/80 border-white/20 text-[10px] text-white">
              <SelectValue placeholder="Select asteroid..." />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-white/20 z-[9999]" container={containerRef.current}>
              <SelectItem value="none" className="text-[10px] text-gray-400">
                None (Show All)
              </SelectItem>
              {asteroids.map(asteroid => {
                const threatLevel = asteroid.torinoScale >= 3 ? 'high' : asteroid.torinoScale >= 1 ? 'medium' : 'low';
                const threatColor = threatLevel === 'high' ? 'text-red-400' : threatLevel === 'medium' ? 'text-amber-400' : 'text-green-400';
                return (
                  <SelectItem 
                    key={asteroid.id} 
                    value={asteroid.id}
                    className="text-[10px]"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        threatLevel === 'high' ? 'bg-red-500' : 
                        threatLevel === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <span className="text-white">{asteroid.name}</span>
                      <span className={`${threatColor} text-[8px]`}>T{asteroid.torinoScale}</span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {selectedAsteroid && (
            <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
              <div className="flex justify-between text-[8px]">
                <span className="text-gray-500">Diameter:</span>
                <span className="text-white font-mono">{selectedAsteroid.diameter}m</span>
              </div>
              <div className="flex justify-between text-[8px]">
                <span className="text-gray-500">Velocity:</span>
                <span className="text-white font-mono">{selectedAsteroid.velocity} km/s</span>
              </div>
              <div className="flex justify-between text-[8px]">
                <span className="text-gray-500">Impact Prob:</span>
                <span className="text-amber-400 font-mono">{(selectedAsteroid.impactProbability * 100).toFixed(4)}%</span>
              </div>
              <div className="flex justify-between text-[8px]">
                <span className="text-gray-500">Orbit Period:</span>
                <span className="text-cyan-400 font-mono">{selectedAsteroid.orbitalPeriod.toFixed(2)} yrs</span>
              </div>
              <div className="flex gap-1 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setOverviewMode(!overviewMode)}
                  className={`flex-1 h-6 text-[9px] ${
                    overviewMode 
                      ? 'bg-amber-500/30 border-amber-500/60 text-amber-400 hover:bg-amber-500/40' 
                      : 'bg-black/80 border-white/20 text-gray-400 hover:bg-white/10 hover:border-amber-400'
                  }`}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {overviewMode ? 'Tracking' : 'Overview'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setOverviewMode(false);
                    onSelectAsteroid(null as any);
                  }}
                  className="flex-1 h-6 bg-cyan-500/20 border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-400 text-[9px] text-cyan-400"
                >
                  <Home className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-1 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsSimulatingImpact(true);
                    setIsPaused(true);
                  }}
                  disabled={isSimulatingImpact}
                  className={`flex-1 h-6 text-[9px] ${
                    isSimulatingImpact 
                      ? 'bg-red-500/30 border-red-500/60 text-red-400 cursor-not-allowed' 
                      : 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30 hover:border-red-400 text-red-400'
                  }`}
                >
                  <Crosshair className="w-3 h-3 mr-1" />
                  {isSimulatingImpact ? 'Simulating' : 'Impact'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDefenseComparison(true)}
                  className="flex-1 h-6 text-[9px] bg-cyan-500/20 border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-400 text-cyan-400"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Compare
                </Button>
              </div>
              
              {/* Overview Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOverviewMode(!overviewMode)}
                className={`w-full h-7 mt-2 text-[9px] ${
                  overviewMode 
                    ? 'bg-amber-500/30 border-amber-500/60 text-amber-400 hover:bg-amber-500/40' 
                    : 'bg-black/80 border-white/20 text-gray-400 hover:bg-white/10 hover:border-amber-400'
                }`}
              >
                <Eye className="w-3 h-3 mr-1" />
                {overviewMode ? 'Tracking Active' : 'Overview Mode'}
              </Button>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col gap-1 pointer-events-auto">
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
      </div>

      {/* Bottom left panels - stacked vertically */}
      <div className="absolute bottom-2 left-2 z-[100] flex flex-col gap-2 pointer-events-auto">
        <div className="border border-white/20 bg-black/90 p-3 pointer-events-auto">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Controls</p>
          <div className="space-y-1.5 text-sm text-gray-300">
            <div className="flex items-center gap-2">🖱️ <span>Drag → Rotate</span></div>
            <div className="flex items-center gap-2">⚙️ <span>Scroll → Zoom</span></div>
            <div className="flex items-center gap-2">⇧ <span>+Drag → Pan</span></div>
          </div>
        </div>

        <div className="border border-white/20 bg-black/90 p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Threat Level</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-sm text-gray-300">Low</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-sm text-gray-300">Med</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-sm text-gray-300">High</span></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 border border-white/20 bg-black/90 p-3 z-[100] pointer-events-auto">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Asteroid Types</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B4513' }} /><span className="text-sm text-gray-300">S-type (Silicate)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2F4F4F' }} /><span className="text-sm text-gray-300">C-type (Carbon)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#696969' }} /><span className="text-sm text-gray-300">X-type (Metallic)</span></div>
        </div>
      </div>
      
      {/* Damage Assessment Overlay */}
      {selectedAsteroid && (
        <DamageAssessmentOverlay
          asteroid={selectedAsteroid}
          isVisible={showDamageAssessment}
          onClose={() => setShowDamageAssessment(false)}
        />
      )}
      
      {/* Defense Comparison Modal */}
      {selectedAsteroid && (
        <DefenseComparisonModal
          asteroid={selectedAsteroid}
          isVisible={showDefenseComparison}
          onClose={() => setShowDefenseComparison(false)}
        />
      )}
    </div>
  );
};

export default OrbitalVisualization;
