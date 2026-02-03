/**
 * Multiplayer (Work Experience) screen component
 * 
 * Displays professional experience as a Minecraft server list.
 * Features:
 * - Server list view with ping simulation
 * - Detail view with full job description on dirt background
 * - Direct connect to company LinkedIn
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
import DirtScreen from '../../common/DirtScreen/DirtScreen';
import ErrorModal from '../../common/ErrorModal/ErrorModal'; 
import experiencesData from '../../../data/experiences.json';
import useServerList from '../../../hooks/useServerList';
import { ERROR_MESSAGES } from '../../../utils/errorMessages';

const Multiplayer = ({ onBack }) => {
  const [view, setView] = useState('LIST');
  const [error, setError] = useState(null); 

  const {
    items: experiences,
    selectedId,
    selectedItem: selectedJob,
    isRefreshing,
    handleRefresh,
    handleSelect
  } = useServerList(experiencesData);

  const handleJoin = () => { 
    if (selectedJob) setView('DETAILS'); 
  };
  
  const handleDirectConnect = () => {
    const url = selectedJob ? selectedJob.link : 'https://linkedin.com/in/yparmar';
    window.open(url, '_blank');
  };

  const handleAddServer = () => setError(ERROR_MESSAGES.ADD_SERVER);
  const handleEdit = () => setError(ERROR_MESSAGES.EDIT_SERVER);
  const handleDelete = () => setError(ERROR_MESSAGES.DELETE_SERVER);

  const handleBack = () => {
    if (view === 'DETAILS') setView('LIST');
    else onBack();
  };

  return (
    <>
      {error && (
        <ErrorModal 
          title={error.title} 
          message={error.message} 
          onClose={() => setError(null)} 
        />
      )}

      {view === 'DETAILS' && selectedJob ? (
        <DirtScreen>
           <div style={{ fontSize: '24px', color: '#aaaaaa', marginBottom: '5px' }}>{selectedJob.name}</div>
           <div style={{ fontSize: '18px', color: '#ffff55' }}>{selectedJob.role}</div>
           <div style={{ fontSize: '16px', color: '#aaaaaa', marginBottom: '15px' }}>{selectedJob.dates}</div>
           
           <div style={{ 
             display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', 
             fontSize: '16px', color: '#ffffff', lineHeight: '1.4', textAlign: 'left', 
             backgroundColor: 'rgba(0,0,0,0.3)', padding: '20px', border: '2px solid #1a1a1a' 
           }}>
             {selectedJob.description.split('\n').map((line, i) => <div key={i}>{line}</div>)}
           </div>
           
           <div style={{ marginTop: '25px', fontSize: '14px', color: '#55ff55', opacity: 0.8 }}>
             Connection established securely.
           </div>
           
           <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '100%', maxWidth: '600px' }}>
             <MinecraftButton style={{ flex: 1 }} onClick={handleDirectConnect}>Direct Connect</MinecraftButton>
             <MinecraftButton style={{ flex: 1 }} onClick={() => setView('LIST')}>Back to Server List</MinecraftButton>
           </div>
        </DirtScreen>
      ) : (
        <MinecraftModal 
          title="Play Multiplayer" 
          onClose={onBack}
          controls={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
                <MinecraftButton style={{ flex: 1 }} onClick={handleJoin} disabled={!selectedId}>Join Server</MinecraftButton>
                <MinecraftButton style={{ flex: 1 }} onClick={handleDirectConnect} disabled={!selectedId}>Direct Connect</MinecraftButton>
                <MinecraftButton style={{ flex: 1 }} onClick={handleAddServer}>Add Server</MinecraftButton>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
                 <MinecraftButton style={{ flex: 1 }} onClick={handleEdit} disabled={!selectedId}>Edit</MinecraftButton>
                 <MinecraftButton style={{ flex: 1 }} onClick={handleDelete} disabled={!selectedId}>Delete</MinecraftButton>
                 <MinecraftButton style={{ flex: 1 }} onClick={handleRefresh}>{isRefreshing ? "..." : "Refresh"}</MinecraftButton>
                 <MinecraftButton style={{ flex: 1 }} onClick={onBack}>Cancel</MinecraftButton>
              </div>
            </div>
          }
        >
           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
             {experiences.map((job) => (
               <ServerSlot 
                 key={job.id}
                 name={job.name}
                 motd={job.role}
                 ping={job.ping}
                 dates={job.dates} 
                 icon={job.icon}
                 selected={selectedId === job.id} 
                 onClick={() => handleSelect(job.id)}
               />
             ))}
           </div>
        </MinecraftModal>
      )}
    </>
  );
};

export default Multiplayer;