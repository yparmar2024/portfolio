/**
 * Minecraft Realms (Social Links) screen component
 * 
 * Displays social media profiles and contact links as Minecraft Realms.
 * Features:
 * - Realm list with status indicators
 * - Direct links to LinkedIn, GitHub, Email, LeetCode, etc.
 * - Humorous error messages for restricted actions
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onBack - Handler to return to main menu
 */

import React, { useState } from 'react';
import MinecraftModal from '../../common/MinecraftModal/MinecraftModal';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import ServerSlot from '../../common/ServerSlot/ServerSlot';
import ErrorModal from '../../common/ErrorModal/ErrorModal';
import socialsData from '../../../data/socials.json';
import useServerList from '../../../hooks/useServerList';
import { ERROR_MESSAGES } from '../../../utils/errorMessages';

const Realms = ({ onBack }) => {
  const [error, setError] = useState(null);

  const {
    items: realms,
    selectedId,
    selectedItem: selectedRealm,
    handleSelect
  } = useServerList(socialsData);

  const handlePlay = () => {
    if (selectedRealm) {
      window.open(selectedRealm.link, '_blank');
    }
  };

  const handleConfigure = () => setError(ERROR_MESSAGES.CONFIGURE_REALM);
  const handleRenew = () => setError(ERROR_MESSAGES.RENEW_REALM);
  const handleLeave = () => setError(ERROR_MESSAGES.LEAVE_REALM);
  const handleAddRealm = () => setError(ERROR_MESSAGES.ADD_REALM);

  return (
    <>
      {error && (
        <ErrorModal 
          title={error.title} 
          message={error.message} 
          onClose={() => setError(null)} 
        />
      )}

      <MinecraftModal 
        title="Minecraft Realms" 
        onClose={onBack}
        controls={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
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
               onClick={() => handleSelect(realm.id)}
             />
           ))}
         </div>
      </MinecraftModal>
    </>
  );
};

export default Realms;