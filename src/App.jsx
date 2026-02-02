// src/App.jsx
import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Panorama from './components/3d/Panorama';

// UPDATED IMPORTS: Pointing to the new "screens" folder structure
import MainMenu from './components/screens/MainMenu/MainMenu';
import Inventory from './components/screens/Inventory/Inventory';

export default function App() {
  // State now handles multiple screens: 'MENU', 'INVENTORY', 'SOCIALS', 'EXPERIENCE'
  const [gameState, setGameState] = useState('MENU');

  const handleBackToMenu = () => {
    setGameState('MENU');
  };

  return (
    <>
      {/* LAYER 1: 3D World (Persists across states) */}
      {/* We blur the background whenever we are NOT on the main menu */}
      <div className={`canvas-layer ${gameState !== 'MENU' ? 'blurred' : ''}`}>
        <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
          <Suspense fallback={null}>
            <Panorama />
          </Suspense>
        </Canvas>
      </div>

      {/* LAYER 2: UI Overlay */}
      <div className="ui-layer">
        
        {gameState === 'MENU' && (
          <MainMenu 
            onSingleplayer={() => setGameState('INVENTORY')}
            onMultiplayer={() => setGameState('SOCIALS')}
            onRealms={() => setGameState('EXPERIENCE')}
          />
        )}

        {gameState === 'INVENTORY' && (
          <Inventory onClose={handleBackToMenu} />
        )}

        {/* Placeholder for Socials (Multiplayer) */}
        {gameState === 'SOCIALS' && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: 'white',
            fontFamily: 'Mojangles, sans-serif'
          }}>
            <h1>Multiplayer Screen</h1>
            <p>Connect to: GitHub, LinkedIn, etc.</p>
            <button onClick={handleBackToMenu} style={{ marginTop: '20px', padding: '10px' }}>
              Cancel (Back)
            </button>
          </div>
        )}

        {/* Placeholder for Experience (Realms) */}
        {gameState === 'EXPERIENCE' && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: 'white',
            fontFamily: 'Mojangles, sans-serif'
          }}>
            <h1>Minecraft Realms</h1>
            <p>Work Experience & Resume Timeline</p>
            <button onClick={handleBackToMenu} style={{ marginTop: '20px', padding: '10px' }}>
              Back to Menu
            </button>
          </div>
        )}

      </div>
    </>
  );
}