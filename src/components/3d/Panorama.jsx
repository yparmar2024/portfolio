import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function Panorama() {
  const meshRef = useRef();
  
  // This is a free, public 4K equirectangular image hosted by the Three.js team
  // It's a park scene, but it tests if your sphere mapping is correct.
  const texture = useLoader(
    THREE.TextureLoader, 
    '/textures/background.jpg'
  );

  useFrame((state, delta) => {
    // Rotates the world slowly around the Y-axis
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05; 
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Huge sphere that surrounds the camera */}
      {/* args: [radius, widthSegments, heightSegments] */}
      <sphereGeometry args={[500, 60, 40]} />
      
      {/* BackSide renders the image on the INSIDE of the sphere */}
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}