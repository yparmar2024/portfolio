import React, { useState } from 'react';
import MinecraftModal from '../../common/MinecraftModal/MinecraftModal';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';

const Options = ({ onBack }) => {
  // Local state to make the menu feel interactive
  const [fov, setFov] = useState('Quake Pro');
  const [difficulty, setDifficulty] = useState('HARD (Engineering)');
  const [music, setMusic] = useState('OFF');
  const [skin, setSkin] = useState('Steve');

  // Toggle handlers
  const toggleFov = () => {
    setFov(prev => prev === 'Quake Pro' ? 'Normal' : prev === 'Normal' ? '30 (Zoom)' : 'Quake Pro');
  };

  const toggleDifficulty = () => {
    const levels = ['PEACEFUL (Vacation)', 'EASY (Scripting)', 'NORMAL (Dev)', 'HARD (Engineering)'];
    const currentIndex = levels.indexOf(difficulty);
    setDifficulty(levels[(currentIndex + 1) % levels.length]);
  };

  const toggleMusic = () => {
    setMusic(prev => prev === 'OFF' ? 'ON' : 'OFF');
  };

  const toggleSkin = () => {
    setSkin(prev => prev === 'Steve' ? 'Alex' : 'Steve');
  };

  return (
    <MinecraftModal 
      title="Options" 
      onClose={onBack}
      controls={
        <MinecraftButton style={{ width: '200px' }} onClick={onBack}>
          Done
        </MinecraftButton>
      }
    >
       {/* Options Grid */}
       <div style={{ 
         display: 'flex', 
         flexDirection: 'column', 
         gap: '10px', 
         alignItems: 'center', 
         padding: '10px 0' 
       }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <MinecraftButton style={{ width: '150px' }} onClick={toggleFov}>
              FOV: {fov}
            </MinecraftButton>
            <MinecraftButton style={{ width: '150px' }} onClick={toggleDifficulty}>
              Difficulty: {difficulty.split(' ')[0]}
            </MinecraftButton>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <MinecraftButton style={{ width: '150px' }} onClick={toggleMusic}>
              Music: {music}
            </MinecraftButton>
            <MinecraftButton style={{ width: '150px' }} onClick={toggleSkin}>
              Skin: {skin}
            </MinecraftButton>
          </div>

          {/* Row 3 - Single Wide Button */}
          <MinecraftButton style={{ width: '310px' }} onClick={() => window.open('https://github.com/yparmar2024', '_blank')}>
            Video Settings... (Source Code)
          </MinecraftButton>

          <MinecraftButton style={{ width: '310px' }} onClick={() => alert("Controls are WASD to move... just kidding, it's a mouse interface.")}>
            Controls...
          </MinecraftButton>
       </div>
    </MinecraftModal>
  );
};

export default Options;