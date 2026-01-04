import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Asteroid, calculateImpactEnergy, calculateDamageRadius } from '@/data/asteroids';
import { useImpactSounds } from '@/hooks/useImpactSounds';

interface ImpactSimulationProps {
  asteroid: Asteroid;
  earthPosition: THREE.Vector3;
  onComplete: () => void;
  onShowDamageAssessment: () => void;
  earthRadius?: number;
}

// Floating debris for damaged Earth phase
const DamagedEarthDebris = ({ 
  earthPosition, 
  earthRadius,
  progress 
}: { 
  earthPosition: THREE.Vector3; 
  earthRadius: number;
  progress: number;
}) => {
  const debrisRef = useRef<THREE.Group>(null);
  const debrisData = useRef<{ 
    positions: THREE.Vector3[]; 
    velocities: THREE.Vector3[];
    rotations: THREE.Euler[];
    scales: number[];
  }>({ positions: [], velocities: [], rotations: [], scales: [] });
  
  useEffect(() => {
    const count = 40;
    const positions: THREE.Vector3[] = [];
    const velocities: THREE.Vector3[] = [];
    const rotations: THREE.Euler[] = [];
    const scales: number[] = [];
    
    for (let i = 0; i < count; i++) {
      // Start from Earth surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.6; // Concentrate on impact hemisphere
      const surfacePos = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).multiplyScalar(earthRadius * 1.1);
      
      positions.push(earthPosition.clone().add(surfacePos));
      
      // Outward velocity
      velocities.push(surfacePos.clone().normalize().multiplyScalar(0.3 + Math.random() * 0.4));
      rotations.push(new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI));
      scales.push(0.03 + Math.random() * 0.08);
    }
    
    debrisData.current = { positions, velocities, rotations, scales };
  }, [earthPosition, earthRadius]);
  
  useFrame((state, delta) => {
    if (!debrisRef.current) return;
    
    debrisRef.current.children.forEach((child, i) => {
      if (i >= debrisData.current.positions.length) return;
      
      const pos = debrisData.current.positions[i];
      const vel = debrisData.current.velocities[i];
      
      // Move outward then slow down
      pos.add(vel.clone().multiplyScalar(delta * (1 - progress * 0.5)));
      child.position.copy(pos);
      
      // Rotate
      child.rotation.x += delta * 0.5;
      child.rotation.y += delta * 0.3;
      
      // Fade out near end
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = 1 - progress;
      }
    });
  });
  
  return (
    <group ref={debrisRef}>
      {debrisData.current.scales.length === 0 && 
        Array.from({ length: 40 }).map((_, i) => (
          <mesh key={i} position={earthPosition.toArray()}>
            <dodecahedronGeometry args={[0.03 + Math.random() * 0.05, 0]} />
            <meshBasicMaterial color="#8B4513" transparent opacity={1} />
          </mesh>
        ))
      }
      {debrisData.current.positions.map((pos, i) => (
        <mesh key={i} position={pos.toArray()} scale={debrisData.current.scales[i]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#8B4513" : "#654321"} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
};

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

// Damaged Earth overlay effect
const DamagedEarth = ({ 
  earthPosition, 
  earthRadius, 
  progress,
  explosionColor 
}: { 
  earthPosition: THREE.Vector3; 
  earthRadius: number; 
  progress: number;
  explosionColor: string;
}) => {
  const crackRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (crackRef.current) {
      crackRef.current.rotation.y += delta * 0.1;
    }
  });
  
  return (
    <group position={earthPosition.toArray()}>
      {/* Damage glow on surface */}
      <Sphere args={[earthRadius * 1.02, 32, 32]}>
        <meshBasicMaterial 
          color={explosionColor}
          transparent 
          opacity={0.4 * (1 - progress)}
        />
      </Sphere>
      
      {/* Smoke/dust cloud */}
      <Sphere args={[earthRadius * 1.15, 16, 16]}>
        <meshBasicMaterial 
          color="#333333"
          transparent 
          opacity={0.3 * (1 - progress)}
        />
      </Sphere>
      
      {/* Impact scar glow */}
      <group ref={crackRef}>
        <mesh position={[earthRadius * 0.9, 0.2, 0.3]}>
          <sphereGeometry args={[earthRadius * 0.3, 16, 16]} />
          <meshBasicMaterial 
            color="#ff4400"
            transparent 
            opacity={0.6 * (1 - progress)}
          />
        </mesh>
        <pointLight 
          position={[earthRadius * 0.9, 0.2, 0.3]} 
          color="#ff6600" 
          intensity={10 * (1 - progress)} 
          distance={5}
        />
      </group>
      
      {/* Atmospheric disturbance rings */}
      {[1.2, 1.4, 1.6].map((scale, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[earthRadius * scale, earthRadius * scale * 1.05, 32]} />
          <meshBasicMaterial 
            color="#ff8844"
            transparent 
            opacity={0.2 * (1 - progress) * (1 - i * 0.2)}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// Main impact effect
const ImpactSimulation = ({ asteroid, earthPosition, onComplete, onShowDamageAssessment, earthRadius = 0.7 }: ImpactSimulationProps) => {
  const [phase, setPhase] = useState<'approach' | 'impact' | 'explosion' | 'aftermath' | 'damaged' | 'reset' | 'complete'>('approach');
  const [progress, setProgress] = useState(0);
  const asteroidRef = useRef<THREE.Group>(null);
  const explosionRef = useRef<THREE.Group>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const soundsTriggered = useRef({ approach: false, impact: false, explosion: false, rumble: false });
  const assessmentShown = useRef(false);
  
  const { playAtmosphericEntry, playExplosion, playRumble, playImpact, initAudioContext } = useImpactSounds();
  
  const impactEnergy = calculateImpactEnergy(asteroid.mass, asteroid.velocity);
  const damageRadius = calculateDamageRadius(impactEnergy);
  
  // Normalize explosion scale based on energy (log scale for visual effect)
  const explosionScale = Math.min(Math.max(Math.log10(impactEnergy + 1) * 0.5, 0.3), 3);
  
  // Sound intensity based on impact energy
  const soundIntensity = Math.min(Math.max(Math.log10(impactEnergy + 1) * 0.3, 0.5), 1.5);
  
  // Initialize audio context on mount (requires user interaction first)
  useEffect(() => {
    initAudioContext();
  }, [initAudioContext]);
  
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
        // Trigger atmospheric entry sound once at the start
        if (!soundsTriggered.current.approach) {
          soundsTriggered.current.approach = true;
          playAtmosphericEntry(2);
        }
        
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
        // Trigger impact sound once
        if (!soundsTriggered.current.impact) {
          soundsTriggered.current.impact = true;
          playImpact();
        }
        
        // Brief flash - 0.1 seconds
        const impactProgress = Math.min(elapsed / 0.1, 1);
        setProgress(impactProgress);
        
        if (impactProgress >= 1) {
          setPhase('explosion');
          startTime.current = Date.now();
        }
        break;
        
      case 'explosion':
        // Trigger explosion sound once
        if (!soundsTriggered.current.explosion) {
          soundsTriggered.current.explosion = true;
          playExplosion(soundIntensity);
        }
        
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
        // Trigger rumble sound once
        if (!soundsTriggered.current.rumble) {
          soundsTriggered.current.rumble = true;
          playRumble(1.5);
        }
        
        // Fade out - 1 second then transition to damaged phase
        const aftermathProgress = Math.min(elapsed / 1, 1);
        setProgress(aftermathProgress);
        
        if (explosionRef.current) {
          explosionRef.current.scale.setScalar(explosionScale * (1 + aftermathProgress * 0.5));
        }
        
        if (aftermathProgress >= 1) {
          setPhase('damaged');
          startTime.current = Date.now();
          // Show damage assessment overlay
          if (!assessmentShown.current) {
            assessmentShown.current = true;
            onShowDamageAssessment();
          }
        }
        break;
        
      case 'damaged':
        // Show damaged Earth with floating debris for 3 seconds
        const damagedProgress = Math.min(elapsed / 3, 1);
        setProgress(damagedProgress);
        
        if (damagedProgress >= 1) {
          setPhase('reset');
          startTime.current = Date.now();
        }
        break;
        
      case 'reset':
        // Quick reset transition - 0.5 seconds
        const resetProgress = Math.min(elapsed / 0.5, 1);
        setProgress(resetProgress);
        
        if (resetProgress >= 1) {
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
      
      {/* Damaged Earth Phase */}
      {phase === 'damaged' && (
        <>
          <DamagedEarth 
            earthPosition={earthPosition}
            earthRadius={earthRadius}
            progress={progress}
            explosionColor={explosionColor}
          />
          <DamagedEarthDebris 
            earthPosition={earthPosition}
            earthRadius={earthRadius}
            progress={progress}
          />
        </>
      )}
      
      {/* Reset Phase - Flash to white then fade */}
      {phase === 'reset' && (
        <group position={earthPosition.toArray()}>
          <Sphere args={[earthRadius * 2, 16, 16]}>
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.5 * (1 - progress)}
            />
          </Sphere>
        </group>
      )}
    </group>
  );
};

export default ImpactSimulation;
