import { useState } from 'react';
import useSound from '../../../hooks/useSound'; // <--- Import the hook
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';

export default function MainMenu({ onSingleplayer, onMultiplayer, onRealms }) {
  // State for the red flash effect
  const [isHurt, setIsHurt] = useState(false);
  
  // Use the custom hook instead of useRef manually
  const playHurt = useSound('/sounds/hurt.ogg');

  const handleQuit = () => {
    // 1. VISUAL: Trigger the red flash
    setIsHurt(true);
    setTimeout(() => setIsHurt(false), 300);

    // 2. AUDIO: Play the sound using our hook
    playHurt();
  };

  return (
    <>
      {/* THE DAMAGE OVERLAY */}
      <div className={`damage-overlay ${isHurt ? 'active' : ''}`} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        zIndex: 10,
        gap: '24px'
      }}>
        
        {/* Title Logo */}
        <img 
          src="/textures/Portfolio.png" 
          alt="Portfolio" 
          style={{ 
            width: '800px', 
            maxWidth: '90%', 
            imageRendering: 'pixelated',
            marginBottom: '40px',
            marginTop: '-10vh',
            filter: 'drop-shadow(0px 10px 0px rgba(0,0,0,0.4))'
          }} 
        />

        {/* Buttons */}
        <MinecraftButton onClick={onSingleplayer} style={{ width: '400px' }}>
          Singleplayer
        </MinecraftButton>

        <MinecraftButton onClick={onMultiplayer} style={{ width: '400px' }}>
          Multiplayer
        </MinecraftButton>

        <MinecraftButton onClick={onRealms} style={{ width: '400px' }}>
          Minecraft Realms
        </MinecraftButton>

        {/* Bottom Row */}
        <div style={{ display: 'flex', gap: '12px', width: '400px' }}>
          <MinecraftButton 
            style={{ flex: 1 }} 
            onClick={() => alert("Accessibility & Theme options coming soon...")}
          >
            Options...
          </MinecraftButton>
          
          <MinecraftButton 
            style={{ flex: 1 }} 
            onClick={handleQuit}
            muteSound={true}
          >
            Quit Game
          </MinecraftButton>
        </div>
        
      </div>
    </>
  );
}