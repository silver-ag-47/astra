import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Asteroid, calculateImpactEnergy, calculateDamageRadius } from '@/data/asteroids';

interface ImpactSimulationProps {
  asteroid: Asteroid;
  earthPosition: THREE.Vector3;
  onComplete: () => void;
  earthRadius?: number;
}

// Particle system for debris
const DebrisParticles = ({ 
  position, 
  count, 
  color, 
  speed,
  lifetime 
}: { 
  position: THREE.Vector3; 
  count: number; 
  color: string;
  speed: number;
  lifetime: number;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleData = useRef<{ 
    positions: THREE.Vector3[]; 
    velocities: THREE.Vector3[]; 
    scales: number[];
    startTime: number;
  }>({ positions: [], velocities: [], scales: [], startTime: Date.now() });

  useEffect(() => {
    const positions: THREE.Vector3[] = [];
    const velocities: THREE.Vector3[] = [];
    const scales: number[] = [];
    
    for (let i = 0; i < count; i++) {
      positions.push(position.clone());
      // Random outward velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const vel = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).multiplyScalar(speed * (0.5 + Math.random()));
      velocities.push(vel);
      scales.push(0.02 + Math.random() * 0.08);
    }
    
    particleData.current = { positions, velocities, scales, startTime: Date.now() };
  }, [position, count, speed]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const elapsed = (Date.now() - particleData.current.startTime) / 1000;
    const progress = Math.min(elapsed / lifetime, 1);
    
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const pos = particleData.current.positions[i];
      const vel = particleData.current.velocities[i];
      
      // Update position
      pos.add(vel.clone().multiplyScalar(delta));
      
      // Fade out scale
      const scale = particleData.current.scales[i] * (1 - progress * progress);
      
      dummy.position.copy(pos);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
};

// Main impact effect
const ImpactSimulation = ({ asteroid, earthPosition, onComplete, earthRadius = 0.7 }: ImpactSimulationProps) => {
  const [phase, setPhase] = useState<'approach' | 'impact' | 'explosion' | 'aftermath' | 'complete'>('approach');
  const [progress, setProgress] = useState(0);
  const asteroidRef = useRef<THREE.Group>(null);
  const explosionRef = useRef<THREE.Group>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  
  const impactEnergy = calculateImpactEnergy(asteroid.mass, asteroid.velocity);
  const damageRadius = calculateDamageRadius(impactEnergy);
  
  // Normalize explosion scale based on energy (log scale for visual effect)
  const explosionScale = Math.min(Math.max(Math.log10(impactEnergy + 1) * 0.5, 0.3), 3);
  
  // Color based on energy level
  const getExplosionColor = () => {
    if (impactEnergy > 1000) return '#ff4444'; // Extinction level - red
    if (impactEnergy > 100) return '#ff8844'; // Major impact - orange
    if (impactEnergy > 10) return '#ffaa44'; // Significant - yellow-orange
    return '#ffdd44'; // Small impact - yellow
  };
  
  const explosionColor = getExplosionColor();

  useFrame((state, delta) => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    switch (phase) {
      case 'approach':
        // Asteroid approaches Earth over 2 seconds
        const approachProgress = Math.min(elapsed / 2, 1);
        setProgress(approachProgress);
        
        if (asteroidRef.current) {
          // Start from outside and move toward Earth
          const startDistance = 8;
          const distance = startDistance - (startDistance - earthRadius) * approachProgress;
          
          const direction = new THREE.Vector3(1, 0.3, 0.5).normalize();
          asteroidRef.current.position.copy(
            earthPosition.clone().add(direction.multiplyScalar(distance))
          );
          
          // Rotate and heat up as it approaches
          asteroidRef.current.rotation.x += delta * 3;
          asteroidRef.current.rotation.y += delta * 2;
        }
        
        if (approachProgress >= 1) {
          setPhase('impact');
          startTime.current = Date.now();
        }
        break;
        
      case 'impact':
        // Brief flash - 0.1 seconds
        const impactProgress = Math.min(elapsed / 0.1, 1);
        setProgress(impactProgress);
        
        if (impactProgress >= 1) {
          setPhase('explosion');
          startTime.current = Date.now();
        }
        break;
        
      case 'explosion':
        // Explosion expands - 1.5 seconds
        const explosionProgress = Math.min(elapsed / 1.5, 1);
        setProgress(explosionProgress);
        
        if (explosionRef.current) {
          // Expand with easing
          const scale = explosionScale * (1 - Math.pow(1 - explosionProgress, 3));
          explosionRef.current.scale.setScalar(scale);
        }
        
        if (shockwaveRef.current) {
          // Shockwave expands faster
          const shockScale = explosionScale * 2 * explosionProgress;
          shockwaveRef.current.scale.set(shockScale, shockScale, 1);
          (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = 
            0.6 * (1 - explosionProgress);
        }
        
        if (explosionProgress >= 1) {
          setPhase('aftermath');
          startTime.current = Date.now();
        }
        break;
        
      case 'aftermath':
        // Fade out - 1.5 seconds
        const aftermathProgress = Math.min(elapsed / 1.5, 1);
        setProgress(aftermathProgress);
        
        if (explosionRef.current) {
          explosionRef.current.scale.setScalar(explosionScale * (1 + aftermathProgress * 0.5));
        }
        
        if (aftermathProgress >= 1) {
          setPhase('complete');
          onComplete();
        }
        break;
    }
  });

  const asteroidSize = Math.min(Math.max(asteroid.diameter / 500, 0.05), 0.3);

  return (
    <group>
      {/* Approaching Asteroid */}
      {phase === 'approach' && (
        <group ref={asteroidRef}>
          <mesh>
            <dodecahedronGeometry args={[asteroidSize, 1]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.8}
              emissive="#ff4400"
              emissiveIntensity={progress * 2}
            />
          </mesh>
          {/* Heat trail */}
          <mesh position={[asteroidSize * 2, 0, 0]}>
            <coneGeometry args={[asteroidSize * 0.8, asteroidSize * 4, 8]} />
            <meshBasicMaterial 
              color="#ff6600" 
              transparent 
              opacity={0.4 + progress * 0.4}
            />
          </mesh>
        </group>
      )}

      {/* Impact Flash */}
      {phase === 'impact' && (
        <group position={earthPosition.toArray()}>
          <pointLight color="#ffffff" intensity={50} distance={20} />
          <Sphere args={[earthRadius * 1.5, 16, 16]}>
            <meshBasicMaterial color="#ffffff" transparent opacity={1 - progress} />
          </Sphere>
        </group>
      )}

      {/* Explosion */}
      {(phase === 'explosion' || phase === 'aftermath') && (
        <group position={earthPosition.toArray()}>
          <group ref={explosionRef}>
            {/* Core */}
            <Sphere args={[0.5, 32, 32]}>
              <meshBasicMaterial 
                color={explosionColor} 
                transparent 
                opacity={phase === 'aftermath' ? 1 - progress : 1}
              />
            </Sphere>
            {/* Inner glow */}
            <Sphere args={[0.7, 24, 24]}>
              <meshBasicMaterial 
                color="#ffaa00" 
                transparent 
                opacity={(phase === 'aftermath' ? 0.6 * (1 - progress) : 0.6)}
              />
            </Sphere>
            {/* Outer glow */}
            <Sphere args={[1, 24, 24]}>
              <meshBasicMaterial 
                color="#ff6600" 
                transparent 
                opacity={(phase === 'aftermath' ? 0.3 * (1 - progress) : 0.3)}
              />
            </Sphere>
            {/* Debris cloud */}
            <Sphere args={[1.3, 16, 16]}>
              <meshBasicMaterial 
                color="#442200" 
                transparent 
                opacity={(phase === 'aftermath' ? 0.2 * (1 - progress) : 0.2)}
              />
            </Sphere>
          </group>
          
          {/* Shockwave ring */}
          <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1, 64]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Point light for illumination */}
          <pointLight 
            color={explosionColor} 
            intensity={phase === 'aftermath' ? 20 * (1 - progress) : 20} 
            distance={30} 
          />
        </group>
      )}

      {/* Debris particles */}
      {(phase === 'explosion' || phase === 'aftermath') && (
        <>
          <DebrisParticles 
            position={earthPosition} 
            count={50} 
            color="#ff8844" 
            speed={2}
            lifetime={3}
          />
          <DebrisParticles 
            position={earthPosition} 
            count={30} 
            color="#664422" 
            speed={1.5}
            lifetime={3}
          />
        </>
      )}
    </group>
  );
};

export default ImpactSimulation;
