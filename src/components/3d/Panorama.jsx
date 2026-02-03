/**
 * Three.js panorama background component
 * 
 * Renders a slowly rotating 360° skybox sphere with day/night texture switching.
 * The camera is positioned inside the sphere looking outward.
 * 
 * Theming:
 * - 'Auto': Switches based on time of day (6 AM - 6 PM = Day)
 * - 'Day': Daytime skybox
 * - 'Night': Nighttime skybox
 * 
 * @component
 * @param {Object} props
 * @param {('Auto'|'Day'|'Night')} props.theme - Theme mode (default: 'Auto')
 */

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { getThemeFromTime } from '../../utils/serverUtils';

export default function Panorama({ theme = 'Auto' }) {
  const meshRef = useRef();

  let currentMode = theme;
  
  if (theme === 'Auto') {
    currentMode = getThemeFromTime();
  }

  const texturePath = currentMode === 'Night' 
    ? '/textures/background_night.png' 
    : '/textures/background_day.png';

  const texture = useLoader(THREE.TextureLoader, texturePath);

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