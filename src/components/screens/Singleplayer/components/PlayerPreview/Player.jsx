import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
// 1. Import the config
import { SLIM_ARMOR_CONFIG as CFG } from '../../../../../constants/armorConfig'; 

const Player = ({ isBookOpen, slots }) => {
  // ... Load Models & Refs (Same as before) ...
  const { nodes: playerNodes } = useGLTF('/models/players/player.glb');
  const { nodes: armorNodes, materials: armorMaterials } = useGLTF('/models/armors/iron/helmet_chestplate_boots.glb');
  const { nodes: legNodes, materials: legMaterials } = useGLTF('/models/armors/iron/leggings.glb');
  
  const mainGroup = useRef(); 
  const { gl } = useThree();
  const [containerCenter, setContainerCenter] = useState({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });

  // ... Armor Checks & Geometry logic (Same as before) ...
  const hasHelmet = slots && slots[39];
  const hasChest = slots && slots[38];
  const hasLegs = slots && slots[37];
  const hasBoots = slots && slots[36];

  const armorMat = Object.values(armorMaterials)[0] || new THREE.MeshStandardMaterial({ color: '#cccccc' });
  const legsMat = Object.values(legMaterials)[0] || armorMat;

  const helmGeo = armorNodes.Helmet?.geometry;
  const chestBodyGeo = armorNodes.Chestplate?.geometry;
  const chestRArmGeo = armorNodes.Right_Arm_Armor?.geometry;
  const chestLArmGeo = armorNodes.Left_Arm_Armor?.geometry;
  const leggingWaistGeo = legNodes.Belt?.geometry;
  const leggingRGeo = legNodes.Right_Leg_Armor?.geometry;
  const leggingLGeo = legNodes.Left_Leg_Armor?.geometry;
  const bootRGeo = armorNodes.Right_Boot?.geometry;
  const bootLGeo = armorNodes.Left_Boot?.geometry;

  // ... Mouse & Animation Logic (Same as before) ...
  const measurePosition = () => {
     if (gl.domElement) {
      const rect = gl.domElement.getBoundingClientRect();
      setContainerCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  };

  useEffect(() => {
    measurePosition();
    window.addEventListener('resize', measurePosition);
    window.addEventListener('scroll', measurePosition);
    return () => { window.removeEventListener('resize', measurePosition); window.removeEventListener('scroll', measurePosition); };
  }, [gl.domElement]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = ((e.clientX - containerCenter.x) / window.innerWidth) * 2.5; 
      mouse.current.y = ((e.clientY - containerCenter.y) / window.innerHeight) * 2.5;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [containerCenter]);

  useFrame(() => {
    if (!playerNodes.Head || !playerNodes.Waist || !mainGroup.current) return;
    const lookX = THREE.MathUtils.clamp(mouse.current.x, -1.2, 1.2);
    const lookY = THREE.MathUtils.clamp(mouse.current.y, -1, 1);
    const smooth = 0.75;
    playerNodes.Head.rotation.y = THREE.MathUtils.lerp(playerNodes.Head.rotation.y, lookX * 0.5, smooth);
    playerNodes.Head.rotation.x = THREE.MathUtils.lerp(playerNodes.Head.rotation.x, -lookY * 0.4, smooth);
    playerNodes.Waist.rotation.y = THREE.MathUtils.lerp(playerNodes.Waist.rotation.y, lookX * 0.3, smooth);
    if (mainGroup.current) mainGroup.current.rotation.x = THREE.MathUtils.lerp(mainGroup.current.rotation.x, lookY * 0.2, smooth);
  });

  return (
    <group ref={mainGroup} position={[0, -2, 0]} scale={2} rotation={[0, Math.PI, 0]}>
      
      <primitive object={playerNodes.Waist} />
      <primitive object={playerNodes.Right_Leg} />
      <primitive object={playerNodes.Left_Leg} />

      {/* HELMET */}
      {hasHelmet && playerNodes.Head && helmGeo && createPortal(
        <mesh 
          geometry={helmGeo} 
          material={armorMat} 
          scale={CFG.helmet.scale} 
          position={CFG.helmet.position} 
        />,
        playerNodes.Head
      )}

      {/* CHESTPLATE */}
      {hasChest && (
        <>
          {playerNodes.Body && chestBodyGeo && createPortal(
            <mesh 
              geometry={chestBodyGeo} 
              material={armorMat} 
              scale={CFG.chest.scale} 
              position={CFG.chest.position} 
            />,
            playerNodes.Body
          )}
          {playerNodes.Right_Arm && chestRArmGeo && createPortal(
            <mesh 
              geometry={chestRArmGeo} 
              material={armorMat} 
              scale={CFG.rightArm.scale} 
              position={CFG.rightArm.position} 
            />,
            playerNodes.Right_Arm
          )}
          {playerNodes.Left_Arm && chestLArmGeo && createPortal(
            <mesh 
              geometry={chestLArmGeo} 
              material={armorMat} 
              scale={CFG.leftArm.scale} 
              position={CFG.leftArm.position} 
            />,
            playerNodes.Left_Arm
          )}
        </>
      )}

      {/* LEGGINGS */}
      {hasLegs && (
        <>
          {playerNodes.Body && leggingWaistGeo && createPortal(
            <mesh 
              geometry={leggingWaistGeo} 
              material={legsMat} 
              scale={CFG.belt.scale} 
              position={CFG.belt.position} 
            />,
            playerNodes.Body
          )}
          {playerNodes.Right_Leg && leggingRGeo && createPortal(
            <mesh 
              geometry={leggingRGeo} 
              material={legsMat} 
              scale={CFG.rightLeg.scale} 
              position={CFG.rightLeg.position} 
            />,
            playerNodes.Right_Leg
          )}
          {playerNodes.Left_Leg && leggingLGeo && createPortal(
            <mesh 
              geometry={leggingLGeo} 
              material={legsMat} 
              scale={CFG.leftLeg.scale} 
              position={CFG.leftLeg.position} 
            />,
            playerNodes.Left_Leg
          )}
        </>
      )}

      {/* BOOTS */}
      {hasBoots && (
        <>
          {playerNodes.Right_Leg && bootRGeo && createPortal(
            <mesh 
              geometry={bootRGeo} 
              material={armorMat} 
              scale={CFG.rightBoot.scale} 
              position={CFG.rightBoot.position} 
            />,
            playerNodes.Right_Leg
          )}
          {playerNodes.Left_Leg && bootLGeo && createPortal(
            <mesh 
              geometry={bootLGeo} 
              material={armorMat} 
              scale={CFG.leftBoot.scale} 
              position={CFG.leftBoot.position} 
            />,
            playerNodes.Left_Leg
          )}
        </>
      )}
    </group>
  );
};

useGLTF.preload('/models/players/player.glb');
useGLTF.preload('/models/armors/iron/helmet_chestplate_boots.glb');
useGLTF.preload('/models/armors/iron/leggings.glb');

export default Player;