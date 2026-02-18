/**
 * Root application component for the Minecraft-themed portfolio.
 *
 * Manages top-level game state and orchestrates screen transitions:
 * - MENU → main title screen
 * - LOADING → dirt-screen transition (TIMINGS.SERVER_REFRESH_DELAY ms)
 * - SINGLEPLAYER → inventory / crafting / terminal experience
 * - MULTIPLAYER → work-experience server list
 * - REALMS → social-links screen
 * - OPTIONS → settings (audio, video, resumes, credits)
 *
 * The Three.js canvas runs continuously as a background layer; the active
 * UI screen is composited on top via an absolutely-positioned overlay.
 *
 * @component
 */

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Panorama from './components/3d/Panorama';
import { useSoundSettings } from './context/SoundContext';
import { TerminalProvider } from './context/TerminalContext';
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
    <TerminalProvider>
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
    </TerminalProvider>
  );
}