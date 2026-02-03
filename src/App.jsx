/**
 * Main application component for the Minecraft-themed portfolio.
 * * This version implements:
 * 1. Orientation Lock: Forces landscape mode via DeviceGuard.
 * 2. Singleplayer Transition: Menu -> Loading (DirtScreen) -> Singleplayer GUI.
 * * @component
 */

import { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Panorama from './components/3d/Panorama';
import { useSoundSettings } from './context/SoundContext';
import Menu from './components/screens/Menu/Menu';
import Singleplayer from './components/screens/Singleplayer/Singleplayer'; 
import Multiplayer from './components/screens/Multiplayer/Multiplayer';
import MinecraftRealms from './components/screens/Realms/Realms';
import Options from './components/screens/Options/Options';
import DirtScreen from './components/common/DirtScreen/DirtScreen';
import DeviceGuard from './components/common/DeviceGuard/DeviceGuard';
import { getThemeFromTime } from './utils/serverUtils';
import { TIMINGS } from './constants/timings';

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

  const handleSingleplayerStart = () => {
    startMusic();
    setGameState('LOADING');
    
    setTimeout(() => {
      setGameState('SINGLEPLAYER');
    }, TIMINGS.SERVER_REFRESH_DELAY);
  };

  const navigateTo = (state) => {
    startMusic();
    setGameState(state);
  };

  const handleBackToMenu = () => {
    setGameState('MENU');
  };

  return (
    <DeviceGuard>
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
            onSingleplayer={handleSingleplayerStart}
            onMultiplayer={() => navigateTo('MULTIPLAYER')}
            onRealms={() => navigateTo('REALMS')}
            onOptions={() => navigateTo('OPTIONS')} 
          />
        )}

        {gameState === 'LOADING' && (
          <DirtScreen>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#fff', marginBottom: '10px' }}>Loading World...</div>
              <div style={{ color: '#aaa' }}>Building Terrain</div>
            </div>
          </DirtScreen>
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
    </DeviceGuard>
  );
}