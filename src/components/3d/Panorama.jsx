// src/components/3d/Panorama.jsx
import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function Panorama() {
  const meshRef = useRef();
  
  // 1. Get the current hour (0 - 23)
  const hour = new Date().getHours();

  // 2. Logic: Night is before 6 AM or after 6 PM (18:00)
  // Otherwise, it is Day.
  const isNight = hour < 6 || hour >= 18;
  
  const texturePath = isNight 
    ? '/textures/background_night.jpg' 
    : '/textures/background_day.jpg';

  // 3. Load the selected texture
  const texture = useLoader(THREE.TextureLoader, texturePath);

  useFrame((state, delta) => {
    // Rotates the world slowly around the Y-axis
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