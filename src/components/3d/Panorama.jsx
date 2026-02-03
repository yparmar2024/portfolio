import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function Panorama({ theme = 'Auto' }) {
  const meshRef = useRef();

  // 1. Resolve the theme
  // If 'Auto' is passed (or default), calculate based on time. 
  // If 'Day' or 'Night' is passed, use it directly.
  let currentMode = theme;
  
  if (theme === 'Auto') {
    const hour = new Date().getHours();
    // Night is before 6 AM or after 6 PM
    currentMode = (hour < 6 || hour >= 18) ? 'Night' : 'Day';
  }

  // 2. Select Texture Path
  const texturePath = currentMode === 'Night' 
    ? '/textures/background_night.png' 
    : '/textures/background_day.png';

  // 3. Load the texture (Suspense will handle the loading state)
  const texture = useLoader(THREE.TextureLoader, texturePath);

  // 4. Rotation Logic (Preserved)
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05; 
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}