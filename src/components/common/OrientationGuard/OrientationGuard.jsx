/**
 * OrientationGuard Component
 * * Detects if the user is on a mobile device in portrait mode.
 * If so, displays a Minecraft-styled "Rotate Device" screen.
 */
import React, { useState, useEffect } from 'react';
import DirtScreen from '../DirtScreen/DirtScreen';

const OrientationGuard = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if width is less than height and screen is "mobile-sized"
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 1024);
    };

    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  if (isPortrait) {
    return (
      <DirtScreen>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <img src="/icons/cursor.png" style={{ width: '40px', transform: 'rotate(90deg)', marginBottom: '20px' }} alt="rotate" />
          <h2 style={{ color: '#ffff55', textShadow: '2px 2px 0 #000' }}>Please Rotate Your Device</h2>
          <p style={{ color: '#fff' }}>This server requires Landscape Mode for the best experience.</p>
        </div>
      </DirtScreen>
    );
  }

  return children;
};

export default OrientationGuard;