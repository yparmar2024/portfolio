/**
 * 3D Player Model component
 *
 * Renders an interactive Minecraft-style player model with dynamic armor rendering.
 * Features mouse-tracking animation with spine twist mechanics and armor attachment system.
 * Uses React Three Fiber portals to attach armor meshes to player bone nodes.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isBookOpen - Controls player animation state
 * @param {Array} props.slots - Inventory slots containing armor items (indices 36-40)
 * @returns {JSX.Element} 3D player model with conditional armor pieces
 */
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SLIM_ARMOR_CONFIG as CFG } from '../../../../../constants/armorConfig';

const Player = ({ isBookOpen, slots }) => {
  // 1. LOAD MODELS
  const { nodes: playerNodes } = useGLTF('/models/players/player.glb');
  const { nodes: armorNodes, materials: armorMaterials } = useGLTF('/models/armors/quartz/helmet_chestplate_boots.glb');
  const { nodes: legNodes, materials: legMaterials } = useGLTF('/models/armors/quartz/leggings.glb');
  const { nodes: shieldNodes, materials: shieldMaterials } = useGLTF('/models/items/git_shield.glb');

  const mainGroup = useRef(); 
  const { gl } = useThree();
  const [containerCenter, setContainerCenter] = useState({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });

  // --- 2. CHECKS ---
  const hasHelmet = slots && slots[39];
  const hasChest = slots && slots[38];
  const hasLegs = slots && slots[37];
  const hasBoots = slots && slots[36];
  const hasShield = slots && slots[40]; 

  // --- 3. MATERIALS ---
  const armorMat = Object.values(armorMaterials)[0] || new THREE.MeshStandardMaterial({ color: '#cccccc' });
  const legsMat = Object.values(legMaterials)[0] || armorMat;
  
  // Use the shield's own material, or fallback to wood color
  const shieldMat = Object.values(shieldMaterials)[0] || new THREE.MeshStandardMaterial({ color: '#886633' });

  // --- 4. GEOMETRIES ---
  const helmGeo = armorNodes.Helmet?.geometry;
  const chestBodyGeo = armorNodes.Chestplate?.geometry;
  const chestRArmGeo = armorNodes.Right_Arm_Armor?.geometry;
  const chestLArmGeo = armorNodes.Left_Arm_Armor?.geometry;
  const leggingWaistGeo = legNodes.Belt?.geometry;
  const leggingRGeo = legNodes.Right_Leg_Armor?.geometry;
  const leggingLGeo = legNodes.Left_Leg_Armor?.geometry;
  const bootRGeo = armorNodes.Right_Boot?.geometry;
  const bootLGeo = armorNodes.Left_Boot?.geometry;

  // --- 5. HELPER: SHIELD RENDERER ---
  // Since your shield has multiple parts (shield_1, shield_2), we render them all.
  const ShieldModel = () => {
    if (!shieldNodes) return null;
    return (
      <group 
        scale={CFG.shield ? CFG.shield.scale : 1} 
        position={CFG.shield ? CFG.shield.position : [0,0,0]} 
        rotation={CFG.shield ? CFG.shield.rotation : [0,0,0]}
      >
        {Object.keys(shieldNodes).map((key) => {
          const node = shieldNodes[key];
          // Only render if it's a mesh with geometry
          if (node.isMesh && node.geometry) {
            return (
              <mesh 
                key={key}
                geometry={node.geometry} 
                material={shieldMat} 
              />
            );
          }
          return null;
        })}
      </group>
    );
  };

  // --- MOUSE & ANIMATION ---
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
    
    // 1. Get Mouse positions
    const lookX = THREE.MathUtils.clamp(mouse.current.x, -1.2, 1.2);
    const lookY = THREE.MathUtils.clamp(mouse.current.y, -1, 1);
    const smooth = 0.75; 

    // 2. THE SPINE TWIST LOGIC

    // A. WHOLE BODY (Feet/Base)
    // Rotate 180 degrees to face camera plus small mouse-following twist
    const targetBodyY = Math.PI + (lookX * 0.2);
    mainGroup.current.rotation.y = THREE.MathUtils.lerp(mainGroup.current.rotation.y, targetBodyY, smooth);
    
    // Body tilt (forward/back)
    mainGroup.current.rotation.x = THREE.MathUtils.lerp(mainGroup.current.rotation.x, lookY * 0.1, smooth);

    // B. WAIST - Turns a bit more (30%) relative to the body
    playerNodes.Waist.rotation.y = THREE.MathUtils.lerp(playerNodes.Waist.rotation.y, lookX * 0.3, smooth);

    // C. HEAD - Turns the most
    playerNodes.Head.rotation.y = THREE.MathUtils.lerp(playerNodes.Head.rotation.y, lookX * 0.6, smooth);
    playerNodes.Head.rotation.x = THREE.MathUtils.lerp(playerNodes.Head.rotation.x, -lookY * 0.5, smooth);
  });

  return (
    <group ref={mainGroup} position={[0, -2, 0]} scale={2} rotation={[0, 0, 0]}>
      
      <primitive object={playerNodes.Waist} />
      <primitive object={playerNodes.Right_Leg} />
      <primitive object={playerNodes.Left_Leg} />

      {/* HELMET */}
      {hasHelmet && playerNodes.Head && helmGeo && createPortal(
        <mesh geometry={helmGeo} material={armorMat} scale={CFG.helmet.scale} position={CFG.helmet.position} />,
        playerNodes.Head
      )}

      {/* CHESTPLATE */}
      {hasChest && (
        <>
          {playerNodes.Body && chestBodyGeo && createPortal(
            <mesh geometry={chestBodyGeo} material={armorMat} scale={CFG.chest.scale} position={CFG.chest.position} />, playerNodes.Body
          )}
          {playerNodes.Right_Arm && chestRArmGeo && createPortal(
            <mesh geometry={chestRArmGeo} material={armorMat} scale={CFG.rightArm.scale} position={CFG.rightArm.position} />, playerNodes.Right_Arm
          )}
          {playerNodes.Left_Arm && chestLArmGeo && createPortal(
            <mesh geometry={chestLArmGeo} material={armorMat} scale={CFG.leftArm.scale} position={CFG.leftArm.position} />, playerNodes.Left_Arm
          )}
        </>
      )}

      {/* LEGGINGS */}
      {hasLegs && (
        <>
          {playerNodes.Body && leggingWaistGeo && createPortal(
             <mesh geometry={leggingWaistGeo} material={legsMat} scale={CFG.belt.scale} position={CFG.belt.position} />, playerNodes.Body
          )}
          {playerNodes.Right_Leg && leggingRGeo && createPortal(
             <mesh geometry={leggingRGeo} material={legsMat} scale={CFG.rightLeg.scale} position={CFG.rightLeg.position} />, playerNodes.Right_Leg
          )}
          {playerNodes.Left_Leg && leggingLGeo && createPortal(
             <mesh geometry={leggingLGeo} material={legsMat} scale={CFG.leftLeg.scale} position={CFG.leftLeg.position} />, playerNodes.Left_Leg
          )}
        </>
      )}

      {/* BOOTS */}
      {hasBoots && (
        <>
          {playerNodes.Right_Leg && bootRGeo && createPortal(
             <mesh geometry={bootRGeo} material={armorMat} scale={CFG.rightBoot.scale} position={CFG.rightBoot.position} />, playerNodes.Right_Leg
          )}
          {playerNodes.Left_Leg && bootLGeo && createPortal(
             <mesh geometry={bootLGeo} material={armorMat} scale={CFG.leftBoot.scale} position={CFG.leftBoot.position} />, playerNodes.Left_Leg
          )}
        </>
      )}

      {/* SHIELD (Attached to Left Arm) */}
      {/* We use the ShieldModel component to render all parts */}
      {hasShield && playerNodes.Left_Arm && createPortal(
        <ShieldModel />,
        playerNodes.Left_Arm
      )}

    </group>
  );
};

useGLTF.preload('/models/players/player.glb');
useGLTF.preload('/models/armors/quartz/helmet_chestplate_boots.glb');
useGLTF.preload('/models/armors/quartz/leggings.glb');
useGLTF.preload('/models/items/git_shield.glb'); 

export default Player;