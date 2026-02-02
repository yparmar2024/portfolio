import { useState, useEffect } from 'react';
import useSound from '../../../hooks/useSound';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';

// List of splash texts to cycle through
const SPLASH_TEXTS = [
  "Hire me!",
  "Open to work!",
  "Start date: ASAP!",
  "Recruiters welcome!",
  "Will code for merch!",
  "O(1) Complexity!",
  "Tabs over Spaces!",
  "Zero Merge Conflicts!",
  "git push --force!",
  "Compiles on first try!"
];

export default function MainMenu({ onSingleplayer, onMultiplayer, onRealms }) {
  // State for the red flash effect
  const [isHurt, setIsHurt] = useState(false);
  // State for the random splash text
  const [splash, setSplash] = useState('');
  
  // Use the custom hook
  const playHurt = useSound('/sounds/hurt.ogg');

  // Select a random splash text on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SPLASH_TEXTS.length);
    setSplash(SPLASH_TEXTS[randomIndex]);
  }, []);

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

      {/* VERSION TEXT (Bottom Left Corner) */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '20px',
        color: '#ffffff',
        fontFamily: 'Mojangles, sans-serif',
        fontSize: '20px',
        textShadow: '2px 2px 0px #000000',
        zIndex: 20,
      }}>
        Portfolio 0.0.0
      </div>

      {/* COPYRIGHT TEXT (Bottom Right Corner) */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '20px',
        color: '#ffffff',
        fontFamily: 'Mojangles, sans-serif',
        fontSize: '20px',
        textShadow: '2px 2px 0px #000000',
        zIndex: 20,
      }}>
        Not affiliated with Mojang Studios
      </div>

      {/* MAIN MENU CONTAINER */}
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
        
        {/* LOGO WRAPPER (Needed to anchor the splash text) */}
        <div style={{
          position: 'relative',
          marginBottom: '40px',
          marginTop: '-10vh',
        }}>
            {/* THE SPLASH TEXT */}
            <div style={{
              position: 'absolute',
              top: '100px',
              right: '-75px',
              color: '#ffff55',
              fontFamily: 'Mojangles, sans-serif',
              fontSize: '24px',
              fontWeight: 'bold',
              textShadow: '2px 2px 0px #3f3f3f',
              width: 'max-content',
              zIndex: 100,
              transform: 'rotate(-20deg)',
              animation: 'splash-bounce 0.5s infinite alternate',
            }}>
              {splash}
            </div>

            {/* Title Logo */}
            {/* TODO: Replace with custom Minecraft-style logo with proper block depth */}
            <img 
              src="/textures/title.png" 
              alt="Portfolio" 
              style={{ 
                width: '800px', 
                maxWidth: '90vw',
                imageRendering: 'pixelated',
                display: 'block',
                filter: 'drop-shadow(0px 10px 0px rgba(0,0,0,0.4))'
              }} 
            />
        </div>

        {/* Buttons */}
        <MinecraftButton onClick={onSingleplayer}>
          Singleplayer
        </MinecraftButton>

        <MinecraftButton onClick={onMultiplayer}>
          Multiplayer
        </MinecraftButton>

        <MinecraftButton onClick={onRealms}>
          Minecraft Realms
        </MinecraftButton>

        {/* Bottom Row */}
        <div style={{ display: 'flex', gap: '24px', width: '450px' }}>
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