import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 1. Accept the prop
const Player = ({ isBookOpen }) => {
  const head = useRef();
  const bodyGroup = useRef();
  const mainGroup = useRef(); 
  
  const { gl } = useThree();
  const [containerCenter, setContainerCenter] = useState({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });

  const skinColors = {
    head: '#f2bfa8',
    shirt: '#00aaaa',
    pants: '#463675',
    skin: '#f2bfa8'
  };

  // Helper function to measure position
  const measurePosition = () => {
    if (gl.domElement) {
      const rect = gl.domElement.getBoundingClientRect();
      setContainerCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 4
      });
    }
  };

  // 2. Logic to handle the Sliding Animation
  useEffect(() => {
    // Measure immediately
    measurePosition();

    // Re-measure continuously for 500ms while the CSS transition runs
    const intervalId = setInterval(measurePosition, 20);
    const timeoutId = setTimeout(() => clearInterval(intervalId), 500);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isBookOpen, gl.domElement]); // Re-run whenever book state changes

  // Standard Resize Listener (Backup)
  useEffect(() => {
    window.addEventListener('resize', measurePosition);
    window.addEventListener('scroll', measurePosition);
    return () => {
      window.removeEventListener('resize', measurePosition);
      window.removeEventListener('scroll', measurePosition);
    };
  }, [gl.domElement]);

  // Mouse Tracking Logic
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

  useFrame(() => {
    if (!head.current || !bodyGroup.current || !mainGroup.current) return;

    const lookX = THREE.MathUtils.clamp(mouse.current.x, -1.2, 1.2);
    const lookY = THREE.MathUtils.clamp(mouse.current.y, -1.2, 1.2);

    const targetHeadY = lookX * 0.8; 
    const targetHeadX = lookY * 0.5; 
    const targetBodyY = lookX * 0.3; 
    const targetMainGroupX = lookY * 0.3;

    const smoothFactor = 0.9;

    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, targetHeadY, smoothFactor);
    head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, targetHeadX, smoothFactor);
    
    bodyGroup.current.rotation.y = THREE.MathUtils.lerp(bodyGroup.current.rotation.y, targetBodyY, smoothFactor);
    mainGroup.current.rotation.x = THREE.MathUtils.lerp(mainGroup.current.rotation.x, targetMainGroupX, smoothFactor);
  });

  return (
    <group ref={mainGroup} position={[0, -1, 0]} scale={1.2}>
      {/* Head */}
      <mesh ref={head} position={[0, 2.25, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={skinColors.head} />
      </mesh>

      {/* Body Group */}
      <group ref={bodyGroup} position={[0, -0.55, 0]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1, 1.5, 0.5]} />
          <meshStandardMaterial color={skinColors.shirt} />
        </mesh>
        <mesh position={[-0.75, 1.5, 0]}>
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color={skinColors.skin} />
        </mesh>
        <mesh position={[0.75, 1.5, 0]}>
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color={skinColors.skin} />
        </mesh>
        <mesh position={[-0.25, 0, 0]}>
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color={skinColors.pants} />
        </mesh>
        <mesh position={[0.25, 0, 0]}>
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color={skinColors.pants} />
        </mesh>
      </group>
    </group>
  );
};

export default Player;