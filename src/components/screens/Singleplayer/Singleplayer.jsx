/**
 * Singleplayer/Inventory screen component
 * 
 * Placeholder for projects/portfolio items section.
 * Styled after Minecraft's inventory UI with classic grey background.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onClose - Handler to return to main menu
 */

import React from 'react';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  container: {
    width: '176px',
    height: '166px',
    background: '#c6c6c6',
    border: '2px solid #000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    boxShadow: 'inset 2px 2px 0px #fff, inset -2px -2px 0px #555',
    imageRendering: 'pixelated',
  },
  text: {
    fontFamily: 'Mojangles, sans-serif',
    color: '#404040',
    fontSize: '20px',
    marginBottom: '20px',
    textAlign: 'center',
  }
};

const Singleplayer = ({ onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.text}>Singleplayer<br/>Coming Soon</div>
        
        <MinecraftButton onClick={onClose} style={{ width: '100%' }}>
          Close
        </MinecraftButton>
      </div>
    </div>
  );
};

export default Singleplayer;