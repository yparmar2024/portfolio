// src/components/screens/Singleplayer/components/PlayerPreview/PlayerPreview.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import Player from './Player';
import styles from './PlayerPreview.module.css';

// FIX: Added 'slots' to props
const PlayerPreview = ({ isBookOpen, slots }) => {
  return (
    <div className={styles.container}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        
        {/* FIX: Pass slots to Player */}
        <Player isBookOpen={isBookOpen} slots={slots} />
      </Canvas>
    </div>
  );
};

export default PlayerPreview;