import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Player = ({ isBookOpen }) => {
  const { nodes } = useGLTF('/models/player.glb');
  
  const mainGroup = useRef(); 
  const { gl } = useThree();
  const [containerCenter, setContainerCenter] = useState({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });

  // --- MOUSE TRACKING & RESIZE LOGIC ---
  const measurePosition = () => {
    if (gl.domElement) {
      const rect = gl.domElement.getBoundingClientRect();
      setContainerCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
  };

  useEffect(() => {
    measurePosition();
    const intervalId = setInterval(measurePosition, 20);
    const timeoutId = setTimeout(() => clearInterval(intervalId), 500);
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isBookOpen, gl.domElement]);

  useEffect(() => {
    window.addEventListener('resize', measurePosition);
    window.addEventListener('scroll', measurePosition);
    return () => {
      window.removeEventListener('resize', measurePosition);
      window.removeEventListener('scroll', measurePosition);
    };
  }, [gl.domElement]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const deltaX = event.clientX - containerCenter.x;
      const deltaY = event.clientY - containerCenter.y;
      
      mouse.current.x = (deltaX / window.innerWidth) * 2.5; 
      mouse.current.y = (deltaY / window.innerHeight) * 2.5;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [containerCenter]);


  // --- ANIMATION LOOP ---
  useFrame(() => {
    if (!nodes.Head || !nodes.Waist || !mainGroup.current) return;

    const lookX = THREE.MathUtils.clamp(mouse.current.x, -1.2, 1.2);
    const lookY = THREE.MathUtils.clamp(mouse.current.y, -1, 1);

    // 1. MAIN GROUP (Tilt whole body forward/back)
    // Keep this positive so the body tilts towards you when looking down
    const targetMainGroupX = lookY * 0.2; 

    // 2. WAIST (Twist Upper Body left/right)
    const targetWaistY = lookX * 0.3; 

    // 3. HEAD (Local Rotation)
    const targetHeadY = lookX * 0.5; 
    
    // FIX APPLIED HERE: Added negative sign (-)
    // Because the character is rotated 180 deg, we invert the X rotation 
    // so Mouse Down = Head Down.
    const targetHeadX = -lookY * 0.4; 

    const smoothFactor = 0.75;

    // Apply Rotations
    nodes.Head.rotation.y = THREE.MathUtils.lerp(nodes.Head.rotation.y, targetHeadY, smoothFactor);
    nodes.Head.rotation.x = THREE.MathUtils.lerp(nodes.Head.rotation.x, targetHeadX, smoothFactor);
    
    nodes.Waist.rotation.y = THREE.MathUtils.lerp(nodes.Waist.rotation.y, targetWaistY, smoothFactor);
    
    mainGroup.current.rotation.x = THREE.MathUtils.lerp(mainGroup.current.rotation.x, targetMainGroupX, smoothFactor);
  });

  return (
    <group ref={mainGroup} position={[0, -2, 0]} scale={2} rotation={[0, Math.PI, 0]}>
      <primitive object={nodes.Waist} />
      <primitive object={nodes.Right_Leg} />
      <primitive object={nodes.Left_Leg} />
    </group>
  );
};

useGLTF.preload('/models/player.glb');

export default Player;