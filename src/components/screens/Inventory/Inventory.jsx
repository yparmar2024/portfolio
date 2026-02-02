import React from 'react';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';

// Inline styles for the placeholder to avoid needing a CSS file immediately
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Darkens the background like standard MC Inventory
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  container: {
    width: '176px', // Standard MC Inventory width approx
    height: '166px',
    background: '#c6c6c6', // Standard grey UI color
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

const Inventory = ({ onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.text}>Inventory<br/>Coming Soon</div>
        
        <MinecraftButton onClick={onClose} style={{ width: '100%' }}>
          Close
        </MinecraftButton>
      </div>
    </div>
  );
};

export default Inventory;