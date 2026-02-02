import React, { useState } from 'react';
import MinecraftModal from '../../common/MinecraftModal/MinecraftModal';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import ServerSlot from '../../common/ServerSlot/ServerSlot';
import DirtScreen from '../../common/DirtScreen/DirtScreen';
import ErrorModal from '../../common/ErrorModal/ErrorModal'; 
import experiencesData from '../../../data/experiences.json'; 

const Multiplayer = ({ onBack }) => {
  const [view, setView] = useState('LIST');
  
  // Track active error state
  const [error, setError] = useState(null); 

  const [experiences, setExperiences] = useState(() => {
    return experiencesData.map(job => ({
      ...job,
      ping: Math.floor(Math.random() * 350) + 20 
    }));
  });

  const [selectedId, setSelectedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedJob = experiences.find(e => e.id === selectedId);

  // --- HANDLERS ---
  const handleJoin = () => { if (selectedJob) setView('DETAILS'); };
  
  const handleDirectConnect = () => {
    const url = selectedJob ? selectedJob.link : 'https://linkedin.com/in/yparmar';
    window.open(url, '_blank');
  };

  const handleAddServer = () => {
    setError({
      title: "Unknown Host", // Classic Minecraft error title
      message: "You can't add a server to this list... unless you're hiring me!\n\nTo unlock this feature, please send a valid Job Offer to: yparmar2024@gmail.com\n\nError Code: OFFER_REQUIRED"
    });
  };

  // --- UPDATED FUNNY HANDLERS ---

  const handleEdit = () => { 
    setError({
      title: "Creative Mode Restricted", // Sounds official...
      message: "Hey! You can't rewrite my history!\nOnly the server admin (Me) has write access to these files.\n\nError Code: NOT_THE_MAIN_CHARACTER" // ...but the message is clearly a joke
    });
  };

  const handleDelete = () => { 
    setError({
      title: "Time Paradox Detected", // Sci-fi / Game trope title
      message: "Wait, that actually happened!\nDeleting this experience would cause a timeline collapse.\n\nError Code: CANON_EVENT" // Spider-verse reference / clear joke
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setExperiences(prev => prev.map(e => ({ ...e, ping: Math.floor(Math.random() * 350) + 20 })));
      setIsRefreshing(false);
    }, 800);
  };

  const handleBack = () => {
    if (view === 'DETAILS') setView('LIST');
    else onBack();
  };

  // --- RENDER ---
  return (
    <>
      {/* ERROR MODAL (The Grey Box) */}
      {error && (
        <ErrorModal 
          title={error.title} 
          message={error.message} 
          onClose={() => setError(null)} 
        />
      )}

      {/* DIRT SCREEN (Details View) */}
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
           
           <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
             <MinecraftButton style={{ width: '200px' }} onClick={handleDirectConnect}>Direct Connect</MinecraftButton>
             <MinecraftButton style={{ width: '200px' }} onClick={() => setView('LIST')}>Back to Server List</MinecraftButton>
           </div>
        </DirtScreen>
      ) : (
        // SERVER LIST MODAL
        <MinecraftModal 
          title="Play Multiplayer" 
          onClose={onBack}
          controls={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
                <MinecraftButton style={{ width: '150px' }} onClick={handleJoin} disabled={!selectedId}>Join Server</MinecraftButton>
                <MinecraftButton style={{ width: '150px' }} onClick={handleDirectConnect}>Direct Connect</MinecraftButton>
                <MinecraftButton style={{ width: '150px' }} onClick={handleAddServer}>Add Server</MinecraftButton>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
                 <MinecraftButton style={{ width: '100px' }} onClick={handleEdit} disabled={!selectedId}>Edit</MinecraftButton>
                 <MinecraftButton style={{ width: '100px' }} onClick={handleDelete} disabled={!selectedId}>Delete</MinecraftButton>
                 <MinecraftButton style={{ width: '100px' }} onClick={handleRefresh}>{isRefreshing ? "..." : "Refresh"}</MinecraftButton>
                 <MinecraftButton style={{ width: '100px' }} onClick={onBack}>Cancel</MinecraftButton>
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
                 icon={job.icon || "/icons/default_server.png"}
                 selected={selectedId === job.id} 
                 onClick={() => setSelectedId(job.id)}
               />
             ))}
           </div>
        </MinecraftModal>
      )}
    </>
  );
};

export default Multiplayer;