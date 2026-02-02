import React from 'react';
import MinecraftModal from '../../common/MinecraftModal/MinecraftModal';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import ServerSlot from '../../common/ServerSlot/ServerSlot';

const Multiplayer = ({ onBack }) => {
  return (
    <MinecraftModal 
      title="Play Multiplayer" 
      onClose={onBack}
      controls={
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
          <MinecraftButton style={{ width: '200px' }} onClick={() => window.open('/resume.pdf', '_blank')}>
              View Resume
          </MinecraftButton>
          <MinecraftButton style={{ width: '200px' }} onClick={onBack}>
              Cancel
          </MinecraftButton>
        </div>
      }
    >
       <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
         {/* These represent your "Servers" (Jobs) */}
         <ServerSlot 
           name="Stevens Institute of Technology"
           motd="Course Assistant - CS 2024"
           ping={10}
           players="Staff"
           icon="/icons/crafting_table.png"
         />
         <ServerSlot 
           name="Blueprint"
           motd="Software Engineer"
           ping={24}
           players="Member"
           icon="/icons/diamond_ore.png"
         />
         <ServerSlot 
           name="Quantum Pulse Consulting"
           motd="Software Engineering Intern"
           ping={99}
           players="Intern"
         />
       </div>
    </MinecraftModal>
  );
};

export default Multiplayer;