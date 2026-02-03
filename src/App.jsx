import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Panorama from './components/3d/Panorama';

// Context Import
import { useSoundSettings } from './context/SoundContext';

// Screen Imports
import Menu from './components/screens/Menu/Menu';
import Singleplayer from './components/screens/Singleplayer/Singleplayer'; 
import Multiplayer from './components/screens/Multiplayer/Multiplayer';
import MinecraftRealms from './components/screens/Realms/Realms';
import Options from './components/screens/Options/Options';

export default function App() {
  // --- NAVIGATION STATE ---
  const [gameState, setGameState] = useState('MENU'); 

  // --- SOUND LOGIC ---
  const { startMusic } = useSoundSettings();

  // --- PERSISTENT SETTINGS STATE ---
  const [videoSetting, setVideoSetting] = useState('Auto');
  const [difficulty, setDifficulty] = useState('Unemployed');

  // --- THEME LOGIC ---
  const getCurrentTheme = () => {
    if (videoSetting === 'Auto') {
      const hour = new Date().getHours();
      return (hour > 6 && hour < 18) ? 'Day' : 'Night';
    }
    return videoSetting;
  };

  const currentTheme = getCurrentTheme();

  // --- HANDLERS ---
  const navigateTo = (state) => {
    // 1. Every time the user clicks a menu button, we attempt to start music.
    // Browsers will ignore this until the first actual click, then it kicks in!
    startMusic();
    setGameState(state);
  };

  const handleBackToMenu = () => {
    setGameState('MENU');
  };

  return (
    <>
      {/* 3D BACKGROUND LAYER */}
      <div className={`canvas-layer ${gameState !== 'MENU' ? 'blurred' : ''}`}>
        <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
          <Suspense fallback={null}>
            <Panorama theme={currentTheme} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI LAYER */}
      <div className="ui-layer">
        
        {/* MAIN MENU */}
        {gameState === 'MENU' && (
          <Menu 
            onSingleplayer={() => navigateTo('SINGLEPLAYER')}
            onMultiplayer={() => navigateTo('MULTIPLAYER')}
            onRealms={() => navigateTo('REALMS')}
            onOptions={() => navigateTo('OPTIONS')} 
          />
        )}

        {/* SINGLEPLAYER -> Inventory */}
        {gameState === 'SINGLEPLAYER' && <Singleplayer onClose={handleBackToMenu} />}
        
        {/* MULTIPLAYER -> Work Experience */}
        {gameState === 'MULTIPLAYER' && <Multiplayer onBack={handleBackToMenu} />}

        {/* REALMS -> Socials */}
        {gameState === 'REALMS' && <MinecraftRealms onBack={handleBackToMenu} />}

        {/* OPTIONS -> Settings */}
        {gameState === 'OPTIONS' && (
          <Options 
            onBack={handleBackToMenu}
            videoSetting={videoSetting}
            setVideoSetting={setVideoSetting}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            // volume/setVolume no longer needed as props!
          />
        )}
      </div>
    </>
  );
}