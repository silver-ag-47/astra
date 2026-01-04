import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MissionHUD, MissionPhase, MissionOutcome } from './MissionHUD';
import { MissionSpacecraft } from './mission/MissionSpacecraft';
import { Explosion, LaserBeam, GravityField, TrajectoryLine } from './mission/MissionEffects';
import { Asteroid, DefenseStrategy } from '@/data/asteroids';
import { useMissionSounds } from '@/hooks/useMissionSounds';

interface MissionOrbitalSimulationProps {
  asteroid: Asteroid;
  strategy: DefenseStrategy;
  onComplete: (success: boolean) => void;
  onShowImpact: () => void;
}

// Earth component
const Earth = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0012;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#4a90d9" />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[0.31, 32, 32]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial color="#6eb5ff" transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>
      <pointLight position={[0, 0, 0]} color="#6eb5ff" intensity={0.5} distance={2} />
    </group>
  );
};

// Asteroid component for the mission
const MissionAsteroid = ({ 
  position, 
  size, 
  destroyed = false,
  deflected = false
}: { 
  position: [number, number, number]; 
  size: number;
  destroyed?: boolean;
  deflected?: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && !destroyed) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
    }
  });

  if (destroyed) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <dodecahedronGeometry args={[size, 1]} />
      <meshStandardMaterial 
        color={deflected ? "#4caf50" : "#8b7355"} 
        roughness={0.8} 
        metalness={0.2}
      />
      {!deflected && (
        <pointLight position={[0, 0, 0]} color="#ff4444" intensity={1} distance={size * 5} />
      )}
    </mesh>
  );
};

// Camera controller for smooth transitions
const CameraController = ({ 
  target, 
  phase 
}: { 
  target: [number, number, number];
  phase: MissionPhase;
}) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 2, 8));
  
  useEffect(() => {
    switch (phase) {
      case 'approach':
        targetPosition.current.set(0, 3, 10);
        break;
      case 'launch':
        targetPosition.current.set(-2, 1, 6);
        break;
      case 'intercept':
        targetPosition.current.set(target[0] * 0.5, target[1] + 2, target[2] + 4);
        break;
      case 'outcome':
        targetPosition.current.set(0, 4, 8);
        break;
    }
  }, [phase, target]);
  
  useFrame(() => {
    camera.position.lerp(targetPosition.current, 0.02);
    camera.lookAt(new THREE.Vector3(...target));
  });
  
  return null;
};

// Main 3D scene
const MissionScene = ({
  asteroid,
  strategy,
  phase,
  setPhase,
  outcome,
  setOutcome,
  onComplete,
  onShowImpact,
  asteroidPosition,
  setAsteroidPosition,
  spacecraftPosition,
  setSpacecraftPosition,
  distanceToEarth,
  setDistanceToEarth,
  distanceToTarget,
  setDistanceToTarget,
  timeRemaining,
  setTimeRemaining,
  sounds
}: {
  asteroid: Asteroid;
  strategy: DefenseStrategy;
  phase: MissionPhase;
  setPhase: (p: MissionPhase) => void;
  outcome: MissionOutcome;
  setOutcome: (o: MissionOutcome) => void;
  onComplete: (success: boolean) => void;
  onShowImpact: () => void;
  asteroidPosition: [number, number, number];
  setAsteroidPosition: (p: [number, number, number]) => void;
  spacecraftPosition: [number, number, number];
  setSpacecraftPosition: (p: [number, number, number]) => void;
  distanceToEarth: number;
  setDistanceToEarth: (d: number) => void;
  distanceToTarget: number;
  setDistanceToTarget: (d: number) => void;
  timeRemaining: number;
  setTimeRemaining: (t: number) => void;
  sounds: ReturnType<typeof useMissionSounds>;
}) => {
  const earthPosition: [number, number, number] = [0, 0, 0];
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [asteroidDestroyed, setAsteroidDestroyed] = useState(false);
  const [asteroidDeflected, setAsteroidDeflected] = useState(false);
  const [showLaser, setShowLaser] = useState(false);
  const [showGravityField, setShowGravityField] = useState(false);
  const phaseStartTime = useRef(Date.now());
  const missionDetermined = useRef(false);
  const launchSoundPlayed = useRef(false);
  const laserSoundPlayed = useRef(false);

  const asteroidSize = useMemo(() => {
    return Math.min(0.3, Math.max(0.1, asteroid.diameter / 1000));
  }, [asteroid.diameter]);

  const calculateSuccess = useCallback(() => {
    // Base success rate from strategy (it's a 0-1 value, convert to percentage)
    let successChance = strategy.successRate * 100;
    
    // Modify based on asteroid size - larger asteroids are harder
    if (asteroid.diameter > 500) successChance -= 15;
    if (asteroid.diameter > 1000) successChance -= 20;
    
    // Modify based on strategy effectiveness for this threat level
    const torinoScale = asteroid.torinoScale || 0;
    if (torinoScale >= 5 && strategy.code !== 'NUKE') {
      successChance -= 20;
    }
    
    return Math.random() * 100 < Math.max(20, successChance);
  }, [asteroid, strategy]);

  useFrame(() => {
    const elapsed = (Date.now() - phaseStartTime.current) / 1000;

    switch (phase) {
      case 'approach': {
        // Asteroid approaches Earth
        const approachSpeed = 0.01;
        const newZ = asteroidPosition[2] + approachSpeed;
        const newPos: [number, number, number] = [asteroidPosition[0], asteroidPosition[1], Math.min(2, newZ)];
        setAsteroidPosition(newPos);
        
        const dist = Math.sqrt(newPos[0] ** 2 + newPos[1] ** 2 + newPos[2] ** 2);
        setDistanceToEarth(dist);
        setTimeRemaining(Math.max(0, 30 - elapsed));
        
        // Transition to launch after 4 seconds
        if (elapsed > 4) {
          setPhase('launch');
          phaseStartTime.current = Date.now();
          launchSoundPlayed.current = false;
        }
        break;
      }

      case 'launch': {
        // Play launch sound at start of launch phase
        if (!launchSoundPlayed.current) {
          launchSoundPlayed.current = true;
          sounds.playLaunch();
        }
        
        // Spacecraft launches from Earth
        const launchProgress = Math.min(1, elapsed / 3);
        const targetDir = new THREE.Vector3(
          asteroidPosition[0] - earthPosition[0],
          asteroidPosition[1] - earthPosition[1],
          asteroidPosition[2] - earthPosition[2]
        ).normalize();
        
        const newSpacecraftPos: [number, number, number] = [
          earthPosition[0] + targetDir.x * launchProgress * 2,
          earthPosition[1] + targetDir.y * launchProgress * 2 + Math.sin(launchProgress * Math.PI) * 0.5,
          earthPosition[2] + targetDir.z * launchProgress * 2
        ];
        setSpacecraftPosition(newSpacecraftPos);
        
        const distToTarget = Math.sqrt(
          (asteroidPosition[0] - newSpacecraftPos[0]) ** 2 +
          (asteroidPosition[1] - newSpacecraftPos[1]) ** 2 +
          (asteroidPosition[2] - newSpacecraftPos[2]) ** 2
        );
        setDistanceToTarget(distToTarget);
        setTimeRemaining(Math.max(0, 26 - elapsed));

        // Start strategy-specific effects
        if (strategy.code === 'LASR' && elapsed > 1) {
          setShowLaser(true);
          // Play laser beam sound
          if (!laserSoundPlayed.current) {
            laserSoundPlayed.current = true;
            sounds.playLaserBeam();
          }
        }
        if (strategy.code === 'GRAV' && elapsed > 2) {
          setShowGravityField(true);
        }
        
        // Transition to intercept after 3 seconds
        if (elapsed > 3) {
          setPhase('intercept');
          phaseStartTime.current = Date.now();
        }
        break;
      }

      case 'intercept': {
        // Spacecraft intercepts asteroid
        const interceptProgress = Math.min(1, elapsed / 4);
        
        // Move spacecraft toward asteroid
        const toAsteroid = new THREE.Vector3(
          asteroidPosition[0] - spacecraftPosition[0],
          asteroidPosition[1] - spacecraftPosition[1],
          asteroidPosition[2] - spacecraftPosition[2]
        );
        const distToAsteroid = toAsteroid.length();
        toAsteroid.normalize();
        
        const speed = strategy.code === 'GRAV' ? 0.02 : 0.05;
        const newSpacecraftPos: [number, number, number] = [
          spacecraftPosition[0] + toAsteroid.x * speed,
          spacecraftPosition[1] + toAsteroid.y * speed,
          spacecraftPosition[2] + toAsteroid.z * speed
        ];
        setSpacecraftPosition(newSpacecraftPos);
        setDistanceToTarget(distToAsteroid);
        setTimeRemaining(Math.max(0, 22 - elapsed));

        // Asteroid continues approaching
        const asteroidApproachSpeed = 0.005;
        const newAsteroidPos: [number, number, number] = [
          asteroidPosition[0],
          asteroidPosition[1],
          Math.min(1, asteroidPosition[2] + asteroidApproachSpeed)
        ];
        setAsteroidPosition(newAsteroidPos);
        
        const earthDist = Math.sqrt(newAsteroidPos[0] ** 2 + newAsteroidPos[1] ** 2 + newAsteroidPos[2] ** 2);
        setDistanceToEarth(earthDist);

        // Check for intercept
        if (distToAsteroid < 0.3 && !missionDetermined.current) {
          missionDetermined.current = true;
          const success = calculateSuccess();
          
          // Show explosion and play appropriate sound
          setExplosionPosition(asteroidPosition);
          setShowExplosion(true);
          
          // Stop laser sound if playing
          if (strategy.code === 'LASR') {
            sounds.stopAllSounds();
          }
          
          // Play impact sound based on strategy
          if (strategy.code === 'NUKE') {
            sounds.playNuclearExplosion();
          } else {
            sounds.playImpact();
          }
          
          if (success) {
            if (strategy.code === 'NUKE' || asteroid.diameter < 200) {
              setAsteroidDestroyed(true);
            } else {
              setAsteroidDeflected(true);
            }
          }
          
          setTimeout(() => {
            setPhase('outcome');
            setOutcome(success ? 'success' : 'failure');
            phaseStartTime.current = Date.now();
            
            // Play success or failure sound
            if (success) {
              sounds.playSuccess();
            } else {
              sounds.playFailure();
            }
          }, 2000);
        }
        break;
      }

      case 'outcome': {
        setTimeRemaining(0);
        
        if (outcome === 'failure' && elapsed > 3) {
          onShowImpact();
        } else if (outcome === 'success' && elapsed > 4) {
          onComplete(true);
        }
        break;
      }
    }
  });

  const getSpacecraftType = () => {
    switch (strategy.code) {
      case 'DART': return 'dart';
      case 'GRAV': return 'gravity';
      case 'NUKE': return 'nuclear';
      case 'LASR': return 'laser';
      default: return 'dart';
    }
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff8866" />

      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Sun */}
      <mesh position={[15, 5, -20]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#ffdd44" />
      </mesh>
      <pointLight position={[15, 5, -20]} intensity={2} color="#ffdd44" distance={50} />

      {/* Earth */}
      <Earth position={earthPosition} />

      {/* Asteroid */}
      <MissionAsteroid 
        position={asteroidPosition} 
        size={asteroidSize}
        destroyed={asteroidDestroyed}
        deflected={asteroidDeflected}
      />

      {/* Trajectory line from asteroid to Earth */}
      {!asteroidDestroyed && !asteroidDeflected && (
        <TrajectoryLine
          points={[asteroidPosition, earthPosition]}
          color="#ff4444"
          dashed
        />
      )}

      {/* Deflected trajectory */}
      {asteroidDeflected && (
        <TrajectoryLine
          points={[
            asteroidPosition, 
            [asteroidPosition[0] + 3, asteroidPosition[1] + 2, asteroidPosition[2] - 3]
          ]}
          color="#00ff00"
          dashed
        />
      )}

      {/* Spacecraft */}
      {phase !== 'approach' && !showExplosion && (
        <MissionSpacecraft
          position={spacecraftPosition}
          type={getSpacecraftType()}
          scale={1}
          showTrail={true}
          trailColor={strategy.code === 'NUKE' ? '#ff5722' : '#00ffff'}
        />
      )}

      {/* Laser beam for LASR strategy */}
      {showLaser && strategy.code === 'LASR' && (
        <LaserBeam
          start={spacecraftPosition}
          end={asteroidPosition}
          color="#4caf50"
          intensity={0.8}
        />
      )}

      {/* Gravity field for GRAV strategy */}
      {showGravityField && strategy.code === 'GRAV' && (
        <GravityField
          center={spacecraftPosition}
          target={asteroidPosition}
          radius={0.4}
          color="#4fc3f7"
        />
      )}

      {/* Explosion */}
      {showExplosion && (
        <Explosion
          position={explosionPosition}
          type={strategy.code === 'NUKE' ? 'nuclear' : 'kinetic'}
          size={strategy.code === 'NUKE' ? 2 : 1}
          color={strategy.code === 'NUKE' ? '#ff9800' : '#ff6b35'}
          onComplete={() => setShowExplosion(false)}
        />
      )}

      {/* Camera controller */}
      <CameraController target={asteroidPosition} phase={phase} />
      
      {/* Orbit controls for manual view */}
      <OrbitControls 
        enablePan={false} 
        minDistance={3} 
        maxDistance={20}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
};

export const MissionOrbitalSimulation = ({
  asteroid,
  strategy,
  onComplete,
  onShowImpact
}: MissionOrbitalSimulationProps) => {
  const [phase, setPhase] = useState<MissionPhase>('approach');
  const [outcome, setOutcome] = useState<MissionOutcome>('pending');
  const [asteroidPosition, setAsteroidPosition] = useState<[number, number, number]>([0, 0, -8]);
  const [spacecraftPosition, setSpacecraftPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [distanceToEarth, setDistanceToEarth] = useState(8);
  const [distanceToTarget, setDistanceToTarget] = useState(8);
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  const sounds = useMissionSounds();

  // Start space ambience on mount
  useEffect(() => {
    sounds.playSpaceAmbience();
    return () => {
      sounds.stopAllSounds();
    };
  }, []);

  const successProbability = useMemo(() => {
    let prob = strategy.successRate * 100;
    if (asteroid.diameter > 500) prob -= 10;
    if (asteroid.diameter > 1000) prob -= 15;
    const torinoScale = asteroid.torinoScale || 0;
    if (torinoScale >= 5 && strategy.code !== 'NUKE') prob -= 15;
    return Math.max(20, Math.min(95, prob));
  }, [asteroid, strategy]);

  return (
    <div className="relative w-full h-full bg-black">
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
        <MissionScene
          asteroid={asteroid}
          strategy={strategy}
          phase={phase}
          setPhase={setPhase}
          outcome={outcome}
          setOutcome={setOutcome}
          onComplete={onComplete}
          onShowImpact={onShowImpact}
          asteroidPosition={asteroidPosition}
          setAsteroidPosition={setAsteroidPosition}
          spacecraftPosition={spacecraftPosition}
          setSpacecraftPosition={setSpacecraftPosition}
          distanceToEarth={distanceToEarth}
          setDistanceToEarth={setDistanceToEarth}
          distanceToTarget={distanceToTarget}
          setDistanceToTarget={setDistanceToTarget}
          timeRemaining={timeRemaining}
          setTimeRemaining={setTimeRemaining}
          sounds={sounds}
        />
      </Canvas>
      
      <MissionHUD
        phase={phase}
        outcome={outcome}
        asteroidName={asteroid.name}
        strategyName={strategy.name}
        strategyType={strategy.code}
        distanceToEarth={distanceToEarth}
        distanceToTarget={distanceToTarget}
        timeRemaining={timeRemaining}
        successProbability={successProbability}
      />
    </div>
  );
};
