import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface TexturedEarthProps {
  position: [number, number, number];
  radius?: number;
  damaged?: boolean;
  damageProgress?: number;
}

const TexturedEarth = ({ 
  position, 
  radius = 0.3,
  damaged = false,
  damageProgress = 0
}: TexturedEarthProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // Load textures
  const earthTexture = useLoader(THREE.TextureLoader, '/textures/earth_daymap.jpg');
  const cloudsTexture = useLoader(THREE.TextureLoader, '/textures/earth_clouds.jpg');
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group position={position}>
      {/* Earth surface */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial 
          map={earthTexture}
          roughness={0.8}
          metalness={0.1}
          emissive={damaged ? "#ff4400" : "#000000"}
          emissiveIntensity={damaged ? damageProgress * 0.5 : 0}
        />
      </mesh>
      
      {/* Clouds layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[radius * 1.02, 64, 64]} />
        <meshStandardMaterial 
          map={cloudsTexture}
          transparent 
          opacity={damaged ? 0.3 * (1 - damageProgress * 0.5) : 0.4}
          depthWrite={false}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.15, 32, 32]} />
        <meshBasicMaterial 
          color={damaged ? "#ff6644" : "#6eb5ff"} 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide} 
        />
      </mesh>
      
      {/* Inner atmosphere rim */}
      <mesh>
        <sphereGeometry args={[radius * 1.08, 32, 32]} />
        <meshBasicMaterial 
          color={damaged ? "#ff8844" : "#88ccff"} 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide} 
        />
      </mesh>
      
      {/* Subtle ambient light from Earth */}
      <pointLight 
        position={[0, 0, 0]} 
        color={damaged ? "#ff6644" : "#6eb5ff"} 
        intensity={damaged ? 1 : 0.3} 
        distance={radius * 5} 
      />
      
      {/* Damage effects */}
      {damaged && damageProgress > 0 && (
        <>
          {/* Impact glow */}
          <mesh rotation={[0.3, 0.5, 0]}>
            <sphereGeometry args={[radius * 0.15, 16, 16]} />
            <meshBasicMaterial 
              color="#ff4400" 
              transparent 
              opacity={0.8 * (1 - damageProgress * 0.3)}
            />
          </mesh>
          <pointLight 
            position={[radius * 0.8, radius * 0.2, radius * 0.3]} 
            color="#ff6600" 
            intensity={5 * (1 - damageProgress * 0.5)} 
            distance={radius * 3}
          />
          
          {/* Smoke/debris cloud */}
          <mesh>
            <sphereGeometry args={[radius * 1.25, 16, 16]} />
            <meshBasicMaterial 
              color="#332211" 
              transparent 
              opacity={0.2 * (1 - damageProgress)}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

export default TexturedEarth;
