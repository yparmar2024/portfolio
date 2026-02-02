import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Panorama from './components/3d/Panorama';

// Screen Imports
import MainMenu from './components/screens/MainMenu/MainMenu';
import Inventory from './components/screens/Inventory/Inventory'; 
import Multiplayer from './components/screens/Multiplayer/Multiplayer';
import MinecraftRealms from './components/screens/Realms/Realms';
import Options from './components/screens/Options/Options';

export default function App() {
  const [gameState, setGameState] = useState('MENU'); 

  const handleBackToMenu = () => {
    setGameState('MENU');
  };

  return (
    <>
      <div className={`canvas-layer ${gameState !== 'MENU' ? 'blurred' : ''}`}>
        <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
          <Suspense fallback={null}>
            <Panorama />
          </Suspense>
        </Canvas>
      </div>

      <div className="ui-layer">
        
        {gameState === 'MENU' && (
          <MainMenu 
            onSingleplayer={() => setGameState('INVENTORY')}
            onMultiplayer={() => setGameState('MULTIPLAYER')}
            onRealms={() => setGameState('REALMS')}
            onOptions={() => setGameState('OPTIONS')} 
          />
        )}

        {/* Singleplayer -> Inventory (Projects/Skills) */}
        {gameState === 'INVENTORY' && <Inventory onClose={handleBackToMenu} />}
        
        {/* Multiplayer -> Multiplayer (Work Experience) */}
        {gameState === 'MULTIPLAYER' && <Multiplayer onBack={handleBackToMenu} />}

        {/* Realms -> MinecraftRealms (Socials) */}
        {gameState === 'REALMS' && <MinecraftRealms onBack={handleBackToMenu} />}

        {gameState === 'OPTIONS' && <Options onBack={handleBackToMenu} />}

      </div>
    </>
  );
}