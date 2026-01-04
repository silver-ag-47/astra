import { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Asteroid } from '@/data/asteroids';
import ImpactSimulation from './ImpactSimulation';

interface ImpactSimulationWrapperProps {
  asteroid: Asteroid;
  onImpactComplete: () => void;
}

const ImpactSimulationWrapper = ({ asteroid, onImpactComplete }: ImpactSimulationWrapperProps) => {
  const [showDamageAssessment, setShowDamageAssessment] = useState(false);
  const earthPosition = new THREE.Vector3(0, 0, 0);
  const earthRadius = 0.5;

  const handleComplete = useCallback(() => {
    // Called when the full impact simulation completes
  }, []);

  const handleShowDamageAssessment = useCallback(() => {
    setShowDamageAssessment(true);
    // Give a moment for the damage phase to show, then complete
    setTimeout(() => {
      onImpactComplete();
    }, 3000);
  }, [onImpactComplete]);

  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 1, 4], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.2} />
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

        {/* Impact simulation */}
        <ImpactSimulation
          asteroid={asteroid}
          earthPosition={earthPosition}
          earthRadius={earthRadius}
          onComplete={handleComplete}
          onShowDamageAssessment={handleShowDamageAssessment}
        />

        <OrbitControls 
          enablePan={false} 
          minDistance={2} 
          maxDistance={15}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* HUD overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pointer-events-none z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-red-500 animate-pulse text-lg">●</div>
            <span className="font-mono text-lg text-red-400 tracking-wider">IMPACT IMMINENT</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">TARGET</div>
            <div className="font-mono text-lg text-foreground">{asteroid.name}</div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none z-10">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground font-mono">
            DIAMETER: {asteroid.diameter}m | VELOCITY: {asteroid.velocity} km/s
          </div>
          <div className="text-sm text-red-400 font-mono animate-pulse">
            DEFENSE FAILED
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactSimulationWrapper;
