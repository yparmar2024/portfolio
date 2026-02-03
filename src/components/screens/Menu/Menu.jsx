import { useState, useEffect } from 'react';
import useSound from '../../../hooks/useSound';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';

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

export default function Menu({ onSingleplayer, onMultiplayer, onRealms, onOptions }) {
  const [isHurt, setIsHurt] = useState(false);
  const [splash, setSplash] = useState('');
  
  const playHurt = useSound('/sounds/hurt.ogg');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SPLASH_TEXTS.length);
    setSplash(SPLASH_TEXTS[randomIndex]);
  }, []);

  const handleQuit = () => {
    setIsHurt(true);
    setTimeout(() => setIsHurt(false), 300);
    playHurt();
  };

  return (
    <>
      <div className={`damage-overlay ${isHurt ? 'active' : ''}`} />

      {/* VERSION TEXT */}
      <div style={{
        position: 'absolute', bottom: '10px', left: '20px',
        color: '#ffffff', fontFamily: 'Mojangles, sans-serif', fontSize: '20px',
        textShadow: '2px 2px 0px #000000', zIndex: 20,
      }}>
        Portfolio 1.0.0
      </div>

      <div style={{
        position: 'absolute', bottom: '10px', right: '20px',
        color: '#ffffff', fontFamily: 'Mojangles, sans-serif', fontSize: '20px',
        textShadow: '2px 2px 0px #000000', zIndex: 20,
      }}>
        Not affiliated with Mojang Studios
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', width: '100%', zIndex: 10
      }}>
        
        {/* LOGO */}
        <div style={{ position: 'relative', marginBottom: '40px', marginTop: '-10vh' }}>
            <div style={{
              position: 'absolute', top: '100px', right: '-75px',
              color: '#ffff55', fontFamily: 'Mojangles, sans-serif', fontSize: '24px',
              fontWeight: 'bold', textShadow: '2px 2px 0px #3f3f3f',
              width: 'max-content', zIndex: 100, transform: 'rotate(-20deg)',
              animation: 'splash-bounce 0.5s infinite alternate',
            }}>
              {splash}
            </div>

            <img 
              src="/textures/title.png" 
              alt="Portfolio" 
              style={{ 
                width: '800px', maxWidth: '90vw', imageRendering: 'pixelated',
                display: 'block', filter: 'drop-shadow(0px 10px 0px rgba(0,0,0,0.4))'
              }} 
            />
        </div>

        {/* RESPONSIVE BUTTON CONTAINER 
           1. width: 100% -> Tries to fill the screen
           2. maxWidth: 450px -> Stops growing at 450px (Desktop look)
           3. padding: 0 20px -> Ensures buttons don't touch screen edges on mobile
        */}
        <div style={{
          display: 'flex', 
          flexDirection: 'column', 
          gap: '14px', 
          width: '100%', 
          maxWidth: '450px', 
          padding: '0 20px',
          boxSizing: 'border-box'
        }}>
          
          {/* Main Buttons - Set to fill the container */}
          <MinecraftButton style={{ width: '100%' }} onClick={onSingleplayer}>
            Singleplayer
          </MinecraftButton>
          
          <MinecraftButton style={{ width: '100%' }} onClick={onMultiplayer}>
            Multiplayer
          </MinecraftButton>
          
          <MinecraftButton style={{ width: '100%' }} onClick={onRealms}>
            Minecraft Realms
          </MinecraftButton>

          {/* Bottom Row - Flex Container fills the parent width */}
          <div style={{ display: 'flex', gap: '14px', width: '100%' }}>
            <MinecraftButton style={{ flex: 1 }} onClick={onOptions}>
              Options...
            </MinecraftButton>
            <MinecraftButton style={{ flex: 1 }} onClick={handleQuit} muteSound={true}>
              Quit Game
            </MinecraftButton>
          </div>

        </div>
        
      </div>
    </>
  );
}