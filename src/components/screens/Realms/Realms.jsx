import React from 'react';
import MinecraftModal from '../../common/MinecraftModal/MinecraftModal';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import ServerSlot from '../../common/ServerSlot/ServerSlot';

const Realms = ({ onBack }) => {
  return (
    <MinecraftModal 
      title="Minecraft Realms" 
      onClose={onBack}
      controls={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
          {/* Top Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
            <MinecraftButton style={{ width: '200px' }} onClick={() => window.open('https://github.com/yparmar2024', '_blank')}>
              Join Realm (GitHub)
            </MinecraftButton>
            <MinecraftButton style={{ width: '200px' }} onClick={() => window.open('https://linkedin.com/in/yparmar', '_blank')}>
              Configure (LinkedIn)
            </MinecraftButton>
          </div>
          
          {/* Bottom Navigation */}
          <MinecraftButton style={{ width: '200px' }} onClick={onBack}>
            Back
          </MinecraftButton>
        </div>
      }
    >
      {/* The "Realms" List (Social Links) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <ServerSlot 
          name="GitHub Repository" 
          motd="Check out my open source projects!" 
          ping={12} 
          players="5000/5000"
          icon="/icons/github.png"
          onClick={() => window.open('https://github.com/yparmar2024', '_blank')}
        />
        <ServerSlot 
          name="LinkedIn Network" 
          motd="Let's connect professionally." 
          ping={45} 
          players="1000+"
          onClick={() => window.open('https://linkedin.com/in/yparmar', '_blank')}
        />
        <ServerSlot 
          name="Email Server" 
          motd="Send me a direct message." 
          ping={5} 
          players="1/1"
          onClick={() => window.location.href = "mailto:yash@example.com"}
        />
      </div>
    </MinecraftModal>
  );
};

export default Realms;