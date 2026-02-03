/**
 * DeviceGuard Component
 * * Enforces a Desktop-only experience by checking for:
 * 1. Mobile/Tablet user agents
 * 2. Minimum screen width (1024px) for desktop clarity
 * * @component
 */
import React, { useState, useEffect } from 'react';
import DirtScreen from '../DirtScreen/DirtScreen';

const DeviceGuard = ({ children }) => {
  const [isInvalidDevice, setIsInvalidDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isSmallScreen = window.innerWidth < 1024;

      setIsInvalidDevice(isMobile || isSmallScreen);
    };

    window.addEventListener('resize', checkDevice);
    checkDevice();
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isInvalidDevice) {
    return (
      <DirtScreen>
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <h1 style={{ color: '#ffff55', textShadow: '3px 3px 0 #000', fontSize: '28px' }}>
            Desktop Required
          </h1>
          <p style={{ color: '#fff', fontSize: '18px', lineHeight: '1.5' }}>
            Yash's Portfolio is a high-fidelity experience built for larger screens.
          </p>
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            padding: '15px', 
            border: '2px solid #555',
            color: '#aaa',
            fontSize: '14px'
          }}>
            Please revisit on a Desktop or Laptop to explore the world.
          </div>
        </div>
      </DirtScreen>
    );
  }

  return children;
};

export default DeviceGuard;