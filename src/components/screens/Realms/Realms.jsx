import React, { useState } from 'react';
import MinecraftModal from '../../common/MinecraftModal/MinecraftModal';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import ServerSlot from '../../common/ServerSlot/ServerSlot';
import ErrorModal from '../../common/ErrorModal/ErrorModal';
import socialsData from '../../../data/socials.json';

const Realms = ({ onBack }) => {
  // 1. Initialize State with Random Pings
  const [realms, setRealms] = useState(() => {
    return socialsData.map(realm => ({
      ...realm,
      ping: Math.floor(Math.random() * 350) + 20
    }));
  });

  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const selectedRealm = realms.find(r => r.id === selectedId);

  // --- HANDLERS ---

  const handlePlay = () => {
    if (selectedRealm) {
      window.open(selectedRealm.link, '_blank');
    }
  };

  const handleConfigure = () => {
    setError({
      title: "Command Blocked", 
      message: "Hey! I see what you're doing.\n\nDon't even think about trying to replace my socials with yours. This is *my* portfolio!\n\n(Go build your own server if you want to self-promote.)\n\nError Code: NO_FREE_CLOUT"
    });
  };

  const handleRenew = () => {
    setError({
      title: "Subscription Status",
      message: "This Realm is currently active!\n\nHowever, if you would like to sponsor a 'Realm Extension' (Employment), please click the Email realm.\n\nStatus: OPEN_TO_WORK"
    });
  };

  const handleLeave = () => {
    setError({
      title: "Cannot Leave Realm",
      message: "Are you sure you want to leave?\n\nThere is still so much code to explore! Please stick around a bit longer.\n\nError Code: STAY_WITH_ME"
    });
  };

  const handleAddRealm = () => {
    setError({
      title: "Limit Reached",
      message: "I am already active on too many platforms!\n\nIf you really need me to join another one, send me an invite via Email.\n\nError Code: TOO_MANY_TABS"
    });
  };

  return (
    <>
      {/* ERROR MODAL */}
      {error && (
        <ErrorModal 
          title={error.title} 
          message={error.message} 
          onClose={() => setError(null)} 
        />
      )}

      {/* REALMS MODAL */}
      <MinecraftModal 
        title="Minecraft Realms" 
        onClose={onBack}
        controls={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
            
            {/* Top Row: Play, Configure, Leave - USING FLEX: 1 */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
              <MinecraftButton style={{ flex: 1 }} onClick={handlePlay} disabled={!selectedId}>
                Play
              </MinecraftButton>
              <MinecraftButton style={{ flex: 1 }} onClick={handleConfigure} disabled={!selectedId}>
                Configure
              </MinecraftButton>
              <MinecraftButton style={{ flex: 1 }} onClick={handleLeave} disabled={!selectedId}>
                Leave Realm
              </MinecraftButton>
            </div>

            {/* Bottom Row: Renew, Add, Back - USING FLEX: 1 */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
               <MinecraftButton style={{ flex: 1 }} onClick={handleRenew} disabled={!selectedId}>
                 Renew
               </MinecraftButton>
               <MinecraftButton style={{ flex: 1 }} onClick={handleAddRealm}>
                 Add Realm
               </MinecraftButton>
               <MinecraftButton style={{ flex: 1 }} onClick={onBack}>
                 Back
               </MinecraftButton>
            </div>
          </div>
        }
      >
         {/* REALMS LIST */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
           {realms.map((realm) => (
             <ServerSlot 
               key={realm.id}
               name={realm.name}
               motd={realm.motd}
               ping={realm.ping}   
               dates={realm.status} 
               icon={realm.icon}
               selected={selectedId === realm.id} 
               onClick={() => setSelectedId(realm.id)}
             />
           ))}
         </div>
      </MinecraftModal>
    </>
  );
};

export default Realms;