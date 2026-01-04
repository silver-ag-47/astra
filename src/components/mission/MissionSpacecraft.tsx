import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MissionSpacecraftProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  type: 'dart' | 'gravity' | 'nuclear' | 'laser';
  showTrail?: boolean;
  trailColor?: string;
}

export const MissionSpacecraft = ({ 
  position, 
  rotation = [0, 0, 0], 
  scale = 1,
  type,
  showTrail = true,
  trailColor = '#00ffff'
}: MissionSpacecraftProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Points>(null);
  const trailPositions = useRef<Float32Array>(new Float32Array(300));
  const trailIndex = useRef(0);

  useFrame(() => {
    if (groupRef.current && showTrail && trailRef.current) {
      // Update trail
      const pos = groupRef.current.position;
      const idx = (trailIndex.current % 100) * 3;
      trailPositions.current[idx] = pos.x;
      trailPositions.current[idx + 1] = pos.y;
      trailPositions.current[idx + 2] = pos.z;
      trailIndex.current++;
      
      const geometry = trailRef.current.geometry;
      geometry.attributes.position.needsUpdate = true;
    }
  });

  const renderSpacecraft = () => {
    switch (type) {
      case 'dart':
        return (
          <group>
            {/* Main body */}
            <mesh>
              <cylinderGeometry args={[0.02, 0.04, 0.15, 8]} />
              <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Nose cone */}
            <mesh position={[0, 0.1, 0]}>
              <coneGeometry args={[0.02, 0.05, 8]} />
              <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Solar panels */}
            <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.01, 0.12, 0.04]} />
              <meshStandardMaterial color="#1a237e" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.01, 0.12, 0.04]} />
              <meshStandardMaterial color="#1a237e" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Engine glow */}
            <pointLight position={[0, -0.1, 0]} color="#00ffff" intensity={2} distance={0.5} />
            <mesh position={[0, -0.08, 0]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color="#00ffff" />
            </mesh>
          </group>
        );

      case 'gravity':
        return (
          <group>
            {/* Large main body */}
            <mesh>
              <boxGeometry args={[0.1, 0.08, 0.1]} />
              <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Large solar arrays */}
            <mesh position={[0.15, 0, 0]}>
              <boxGeometry args={[0.2, 0.01, 0.15]} />
              <meshStandardMaterial color="#1a237e" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[-0.15, 0, 0]}>
              <boxGeometry args={[0.2, 0.01, 0.15]} />
              <meshStandardMaterial color="#1a237e" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Thruster pods */}
            <mesh position={[0, -0.06, 0]}>
              <cylinderGeometry args={[0.02, 0.025, 0.04, 8]} />
              <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
            </mesh>
            <pointLight position={[0, -0.08, 0]} color="#4fc3f7" intensity={1} distance={0.3} />
          </group>
        );

      case 'nuclear':
        return (
          <group>
            {/* Missile body */}
            <mesh>
              <cylinderGeometry args={[0.025, 0.03, 0.2, 8]} />
              <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Warhead */}
            <mesh position={[0, 0.12, 0]}>
              <coneGeometry args={[0.025, 0.06, 8]} />
              <meshStandardMaterial color="#ff9800" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Warning stripes */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.026, 0.026, 0.02, 8]} />
              <meshBasicMaterial color="#ffeb3b" />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.026, 0.026, 0.02, 8]} />
              <meshBasicMaterial color="#ffeb3b" />
            </mesh>
            {/* Fins */}
            {[0, 90, 180, 270].map((angle, i) => (
              <mesh key={i} position={[0, -0.08, 0]} rotation={[0, (angle * Math.PI) / 180, 0]}>
                <boxGeometry args={[0.002, 0.04, 0.03]} />
                <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
              </mesh>
            ))}
            {/* Engine flame */}
            <pointLight position={[0, -0.12, 0]} color="#ff5722" intensity={3} distance={0.4} />
            <mesh position={[0, -0.11, 0]}>
              <coneGeometry args={[0.02, 0.04, 8]} />
              <meshBasicMaterial color="#ff5722" transparent opacity={0.8} />
            </mesh>
          </group>
        );

      case 'laser':
        return (
          <group>
            {/* Platform body */}
            <mesh>
              <boxGeometry args={[0.12, 0.04, 0.12]} />
              <meshStandardMaterial color="#424242" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Laser emitter */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.03, 0.04, 0.04, 16]} />
              <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshBasicMaterial color="#4caf50" />
            </mesh>
            {/* Solar panels */}
            <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
              <boxGeometry args={[0.15, 0.005, 0.1]} />
              <meshStandardMaterial color="#1a237e" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[-0.12, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <boxGeometry args={[0.15, 0.005, 0.1]} />
              <meshStandardMaterial color="#1a237e" metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Power core glow */}
            <pointLight position={[0, 0, 0]} color="#4caf50" intensity={2} distance={0.3} />
          </group>
        );

      default:
        return null;
    }
  };

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {renderSpacecraft()}
      {showTrail && (
        <points ref={trailRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={100}
              array={trailPositions.current}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.01} color={trailColor} transparent opacity={0.6} />
        </points>
      )}
    </group>
  );
};
