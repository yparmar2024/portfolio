/**
 * Full-screen dirt texture background component
 * 
 * Used for "loading screens" and detail views (like work experience details).
 * Mimics Minecraft's classic dirt block background with pixelated texture tiling.
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display over the dirt background
 */

import React from 'react';
import styles from './DirtScreen.module.css';

const DirtScreen = ({ children }) => {
  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default DirtScreen;