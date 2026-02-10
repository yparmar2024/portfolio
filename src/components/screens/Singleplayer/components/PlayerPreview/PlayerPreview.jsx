/**
 * Player Preview Canvas component
 *
 * Renders a Three.js canvas containing the 3D player model with armor visualization.
 * Configures camera position, lighting, and passes inventory data to the Player component.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isBookOpen - Whether the recipe book is open (affects player animation)
 * @param {Array} props.slots - Inventory slots array containing armor items
 * @returns {JSX.Element} Canvas with 3D player preview
 */
import React from 'react';
import { Canvas } from '@react-three/fiber';
import Player from './Player';
import styles from './PlayerPreview.module.css';

const PlayerPreview = ({ isBookOpen, slots }) => {
  return (
    <div className={styles.container}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />

        <Player isBookOpen={isBookOpen} slots={slots} />
      </Canvas>
    </div>
  );
};

export default PlayerPreview;