import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface ExplosionProps {
  position: [number, number, number];
  size?: number;
  color?: string;
  type: 'kinetic' | 'nuclear' | 'debris';
  onComplete?: () => void;
}

export const Explosion = ({ 
  position, 
  size = 1, 
  color = '#ff6b35',
  type,
  onComplete
}: ExplosionProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now());
  const duration = type === 'nuclear' ? 3000 : 1500;

  const particleCount = type === 'nuclear' ? 500 : type === 'kinetic' ? 200 : 100;
  
  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Start at center
      pos[i3] = 0;
      pos[i3 + 1] = 0;
      pos[i3 + 2] = 0;
      
      // Random velocity direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = (0.5 + Math.random() * 1.5) * size * 0.1;
      
      vel[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vel[i3 + 2] = Math.cos(phi) * speed;
      
      // Color variation
      const hsl = { h: 0, s: 0, l: 0 };
      baseColor.getHSL(hsl);
      const particleColor = new THREE.Color().setHSL(
        hsl.h + (Math.random() - 0.5) * 0.1,
        hsl.s,
        hsl.l + (Math.random() - 0.5) * 0.3
      );
      col[i3] = particleColor.r;
      col[i3 + 1] = particleColor.g;
      col[i3 + 2] = particleColor.b;
    }
    
    return [pos, vel, col];
  }, [particleCount, size, color]);

  useFrame(() => {
    if (!particlesRef.current) return;
    
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    
    const geometry = particlesRef.current.geometry;
    const posAttr = geometry.attributes.position;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      posAttr.array[i3] += velocities[i3] * (1 - progress * 0.5);
      posAttr.array[i3 + 1] += velocities[i3 + 1] * (1 - progress * 0.5);
      posAttr.array[i3 + 2] += velocities[i3 + 2] * (1 - progress * 0.5);
    }
    posAttr.needsUpdate = true;
    
    // Fade out
    const material = particlesRef.current.material as THREE.PointsMaterial;
    material.opacity = 1 - progress;
    
    if (progress >= 1 && onComplete) {
      onComplete();
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Core flash */}
      <mesh scale={[size * (1 - Math.min((Date.now() - startTime.current) / 500, 1)), size * (1 - Math.min((Date.now() - startTime.current) / 500, 1)), size * (1 - Math.min((Date.now() - startTime.current) / 500, 1))]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      
      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={type === 'nuclear' ? 0.02 : 0.01}
          vertexColors
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Shockwave ring for nuclear */}
      {type === 'nuclear' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, size * 0.3, 32]} />
          <meshBasicMaterial color="#ffeb3b" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

interface LaserBeamProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  intensity?: number;
  pulsing?: boolean;
}

export const LaserBeam = ({ 
  start, 
  end, 
  color = '#4caf50',
  intensity = 1,
}: LaserBeamProps) => {
  return (
    <group>
      {/* Core beam */}
      <Line
        points={[start, end]}
        color={color}
        lineWidth={2}
        transparent
        opacity={intensity}
      />
      {/* Glow effect */}
      <Line
        points={[start, end]}
        color={color}
        lineWidth={4}
        transparent
        opacity={intensity * 0.3}
      />
      {/* Impact point glow */}
      <pointLight position={end} color={color} intensity={intensity * 2} distance={0.5} />
    </group>
  );
};

interface GravityFieldProps {
  center: [number, number, number];
  target: [number, number, number];
  radius?: number;
  color?: string;
}

export const GravityField = ({ center, target, radius = 0.3, color = '#4fc3f7' }: GravityFieldProps) => {
  const linesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = clock.elapsedTime * 0.5;
      linesRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const direction = useMemo(() => {
    return new THREE.Vector3(
      target[0] - center[0],
      target[1] - center[1],
      target[2] - center[2]
    ).normalize();
  }, [center, target]);

  return (
    <group position={center}>
      {/* Field lines */}
      <group ref={linesRef}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <mesh key={i} rotation={[0, (angle * Math.PI) / 180, 0]}>
            <torusGeometry args={[radius, 0.002, 8, 32, Math.PI]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
      {/* Connection beam to target */}
      <Line
        points={[
          [0, 0, 0],
          [direction.x * radius * 2, direction.y * radius * 2, direction.z * radius * 2]
        ]}
        color={color}
        transparent
        opacity={0.6}
      />
    </group>
  );
};

interface TrajectoryLineProps {
  points: [number, number, number][];
  color?: string;
  dashed?: boolean;
}

export const TrajectoryLine = ({ points, color = '#ff0000', dashed = false }: TrajectoryLineProps) => {
  return (
    <Line
      points={points}
      color={color}
      transparent
      opacity={0.7}
      dashed={dashed}
      dashSize={0.05}
      gapSize={0.03}
    />
  );
};

interface DeflectedAsteroidProps {
  position: [number, number, number];
  originalTrajectory: [number, number, number];
  newTrajectory: [number, number, number];
  size?: number;
}

export const DeflectedAsteroid = ({ 
  position, 
  originalTrajectory, 
  newTrajectory,
  size = 0.1
}: DeflectedAsteroidProps) => {
  const asteroidRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (asteroidRef.current) {
      asteroidRef.current.rotation.x += 0.01;
      asteroidRef.current.rotation.y += 0.015;
      
      // Move along new trajectory
      asteroidRef.current.position.x += newTrajectory[0] * 0.001;
      asteroidRef.current.position.y += newTrajectory[1] * 0.001;
      asteroidRef.current.position.z += newTrajectory[2] * 0.001;
    }
  });

  return (
    <group>
      <mesh ref={asteroidRef} position={position}>
        <dodecahedronGeometry args={[size, 1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.8} />
      </mesh>
      {/* New safe trajectory indicator */}
      <TrajectoryLine
        points={[
          position,
          [position[0] + newTrajectory[0], position[1] + newTrajectory[1], position[2] + newTrajectory[2]]
        ]}
        color="#00ff00"
        dashed
      />
    </group>
  );
};
