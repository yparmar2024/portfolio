/**
 * Main menu screen component.
 *
 * Replicates the Minecraft Java Edition title screen with:
 * - Title image with a rotating splash text overlay
 * - Primary navigation buttons (Singleplayer, Multiplayer, Realms, Options)
 * - A "Quit Game" button that plays a hurt sound and fires a screen-shake animation
 * - A version badge (bottom-left) that opens the Playbook (patch notes) overlay
 *
 * @component
 * @param {Object}   props
 * @param {Function} props.onSingleplayer - Navigate to inventory / crafting screen
 * @param {Function} props.onMultiplayer  - Navigate to work-experience screen
 * @param {Function} props.onRealms       - Navigate to social-links screen
 * @param {Function} props.onOptions      - Navigate to settings screen
 */

import { useState, useEffect } from 'react';
import useSound from '../../../hooks/useSound';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import Playbook from '../Playbook/Playbook';
import patchNotes from '../../../data/patchNotes.json';
import { TIMINGS } from '../../../constants/timings';

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
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [isVersionHovered, setIsVersionHovered] = useState(false);

  const latestVersion = patchNotes.length > 0 ? patchNotes[0].version : "1.0.0";

  const playHurt = useSound('/sounds/hurt.ogg');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SPLASH_TEXTS.length);
    setSplash(SPLASH_TEXTS[randomIndex]);
  }, []);

  const handleQuit = () => {
    setIsHurt(true);
    setTimeout(() => setIsHurt(false), TIMINGS.DAMAGE_OVERLAY_DURATION);
    playHurt();
  };

  return (
    <>
      {showPlaybook && <Playbook onClose={() => setShowPlaybook(false)} />}

      <div className={`damage-overlay ${isHurt ? 'active' : ''}`} />

      <div
        onClick={() => setShowPlaybook(true)}
        onMouseEnter={() => setIsVersionHovered(true)}
        onMouseLeave={() => setIsVersionHovered(false)}
        style={{
          position: 'absolute', bottom: '15px', left: '20px',
          display: 'flex', alignItems: 'center', gap: '8px',
          zIndex: 20, cursor: 'pointer',
          transition: 'transform 0.1s ease-out'
        }}
        title="Click to view Patch Notes"
      >
        <img
          src="/icons/items/book_and_quill.png"
          alt="Patch Notes"
          style={{
            width: '48px', height: '48px',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(2px 2px 0px #000000)'
          }}
        />
        <span style={{
          color: isVersionHovered ? '#ffff55' : '#ffffff',
          fontFamily: 'Mojangles, sans-serif', fontSize: '20px',
          textShadow: '2px 2px 0px #000000',
          textDecoration: isVersionHovered ? 'underline' : 'none',
          transition: 'color 0.1s',
          marginLeft: '8px',
          marginBottom: '-8px'
        }}>
          Portfolio {latestVersion}
        </span>
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

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '100%',
          maxWidth: '450px',
          padding: '0 20px',
        }}>
          <MinecraftButton style={{ width: '100%' }} onClick={onSingleplayer}>
            Singleplayer
          </MinecraftButton>

          <MinecraftButton style={{ width: '100%' }} onClick={onMultiplayer}>
            Multiplayer
          </MinecraftButton>

          <MinecraftButton style={{ width: '100%' }} onClick={onRealms}>
            Minecraft Realms
          </MinecraftButton>

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
