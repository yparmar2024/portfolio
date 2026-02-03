/**
 * Main application component for the Minecraft-themed portfolio
 * 
 * Manages global navigation state, theme switching, and sound initialization.
 * Renders a Three.js panorama background with UI overlays for different screens.
 * 
 * Architecture:
 * - Canvas layer: Three.js panorama (blurs when navigating away from menu)
 * - UI layer: React-based screen components (Menu, Options, Work Experience, etc.)
 * 
 * @component
 */

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Panorama from './components/3d/Panorama';
import { useSoundSettings } from './context/SoundContext';
import Menu from './components/screens/Menu/Menu';
import Singleplayer from './components/screens/Singleplayer/Singleplayer'; 
import Multiplayer from './components/screens/Multiplayer/Multiplayer';
import MinecraftRealms from './components/screens/Realms/Realms';
import Options from './components/screens/Options/Options';
import { getThemeFromTime } from './utils/serverUtils';

export default function App() {
  const [gameState, setGameState] = useState('MENU'); 
  const { startMusic } = useSoundSettings();
  const [videoSetting, setVideoSetting] = useState('Auto');
  const [difficulty, setDifficulty] = useState('Unemployed');

  const getCurrentTheme = () => {
    if (videoSetting === 'Auto') {
      return getThemeFromTime();
    }
    return videoSetting;
  };

  const currentTheme = getCurrentTheme();

  /**
   * Handles navigation between screens and initiates music playback
   * Browser autoplay restrictions require user interaction before audio can play
   * @param {string} state - Target screen state identifier
   */
  const navigateTo = (state) => {
    startMusic();
    setGameState(state);
  };

  const handleBackToMenu = () => {
    setGameState('MENU');
  };

  return (
    <>
      <div className={`canvas-layer ${gameState !== 'MENU' ? 'blurred' : ''}`}>
        <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
          <Suspense fallback={null}>
            <Panorama theme={currentTheme} />
          </Suspense>
        </Canvas>
      </div>

      <div className="ui-layer">
        {gameState === 'MENU' && (
          <Menu 
            onSingleplayer={() => navigateTo('SINGLEPLAYER')}
            onMultiplayer={() => navigateTo('MULTIPLAYER')}
            onRealms={() => navigateTo('REALMS')}
            onOptions={() => navigateTo('OPTIONS')} 
          />
        )}

        {gameState === 'SINGLEPLAYER' && <Singleplayer onClose={handleBackToMenu} />}
        {gameState === 'MULTIPLAYER' && <Multiplayer onBack={handleBackToMenu} />}
        {gameState === 'REALMS' && <MinecraftRealms onBack={handleBackToMenu} />}

        {gameState === 'OPTIONS' && (
          <Options 
            onBack={handleBackToMenu}
            videoSetting={videoSetting}
            setVideoSetting={setVideoSetting}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        )}
      </div>
    </>
  );
}