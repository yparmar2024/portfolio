import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Panorama from './components/3d/Panorama';

import MainMenu from './components/screens/MainMenu/MainMenu';
import Inventory from './components/screens/Inventory/Inventory'; // We will build this next
import MinecraftModal from './components/common/MinecraftModal/MinecraftModal';

export default function App() {
  const [gameState, setGameState] = useState('MENU'); // 'MENU', 'INVENTORY', 'SOCIALS', 'EXPERIENCE', 'OPTIONS'

  const handleBackToMenu = () => {
    setGameState('MENU');
  };

  return (
    <>
      {/* LAYER 1: 3D World */}
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
            onOptions={() => setGameState('OPTIONS')} // <--- Need to add this prop to MainMenu!
          />
        )}

        {/* --- THE NEW MODALS --- */}

        {gameState === 'SOCIALS' && (
          <MinecraftModal title="Multiplayer (Socials)" onClose={handleBackToMenu}>
            <p>Connect to the server...</p>
            <ul>
              <li>GitHub: github.com/yash</li>
              <li>LinkedIn: linkedin.com/in/yash</li>
            </ul>
          </MinecraftModal>
        )}

        {gameState === 'EXPERIENCE' && (
          <MinecraftModal title="Minecraft Realms" onClose={handleBackToMenu}>
             <p>Select a Realm (Work Experience):</p>
             {/* We will populate this later */}
             <div style={{ padding: '20px' }}>
               <p>Course Assistant - Stevens Institute</p>
               <p>Software Engineer - Blueprint</p>
             </div>
          </MinecraftModal>
        )}

        {gameState === 'OPTIONS' && (
          <MinecraftModal title="Options" onClose={handleBackToMenu}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <p>Music: OFF</p>
                <p>Difficulty: HARD (Engineering Major)</p>
                <p>FOV: Quake Pro</p>
             </div>
          </MinecraftModal>
        )}

        {/* --- INVENTORY (Specific Logic) --- */}
        {gameState === 'INVENTORY' && (
          <Inventory onClose={handleBackToMenu} />
        )}

      </div>
    </>
  );
}