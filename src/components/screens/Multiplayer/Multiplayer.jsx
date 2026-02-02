import React, { useState } from 'react';
import MinecraftModal from '../../common/MinecraftModal/MinecraftModal';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import ServerSlot from '../../common/ServerSlot/ServerSlot';

// 1. IMPORT THE JSON DATA
import experiencesData from '../../../data/experiences.json'; 

// (Delete the entire 'const INITIAL_EXPERIENCES = [...]' block here)

const Multiplayer = ({ onBack }) => {
  // 2. INITIALIZE STATE WITH IMPORTED DATA
  const [experiences, setExperiences] = useState(experiencesData);
  
  const [selectedId, setSelectedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper: Get the actual object of the selected job
  const selectedJob = experiences.find(e => e.id === selectedId);

  // --- HANDLERS ---

  const handleJoin = () => {
    if (selectedJob) {
      alert(`Connecting to ${selectedJob.name}...\n\nRole: ${selectedJob.role}\nTime: ${selectedJob.dates}\n\nWork Done:\n${selectedJob.description}`);
    }
  };

  const handleDirectConnect = () => {
    // If selected, go to that specific site. If not, go to generic (LinkedIn/Portfolio)
    const url = selectedJob ? selectedJob.link : 'https://linkedin.com/in/yparmar';
    window.open(url, '_blank');
  };

  const handleAddServer = () => {
    const email = "yparmar2024@gmail.com";
    const subject = "Hiring Inquiry: New Server Opportunity";
    const body = "Hello, I would like to add a new server (job opportunity) to your list...";
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleEdit = () => {
    // Funny Error: Only triggers if button is enabled (which requires selection)
    alert("Error: Stop trying to change my experience! 😠\n(Permission Denied: You are not an Admin)");
  };

  const handleDelete = () => {
    // Funny Error
    alert("Error: Stop trying to change my past! 🕰️\n(Cannot delete immutable history)");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newExperiences = experiences.map(exp => ({
        ...exp,
        ping: Math.floor(Math.random() * 55) + 5 
      }));
      setExperiences(newExperiences);
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <MinecraftModal 
      title="Play Multiplayer" 
      onClose={onBack}
      controls={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
          
          {/* --- TOP ROW --- */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
            
            {/* JOIN: Disabled if no selection */}
            <MinecraftButton 
              style={{ width: '150px' }} 
              onClick={handleJoin}
              disabled={!selectedId} 
            >
              Join Server
            </MinecraftButton>

            {/* DIRECT CONNECT: Always Enabled */}
            <MinecraftButton style={{ width: '150px' }} onClick={handleDirectConnect}>
              Direct Connect
            </MinecraftButton>

            {/* ADD SERVER: Always Enabled */}
             <MinecraftButton style={{ width: '150px' }} onClick={handleAddServer}>
              Add Server
            </MinecraftButton>
          </div>

          {/* --- BOTTOM ROW --- */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
             
             {/* EDIT: Disabled if no selection */}
             <MinecraftButton 
               style={{ width: '100px' }} 
               onClick={handleEdit}
               disabled={!selectedId}
             >
               Edit
             </MinecraftButton>
             
             {/* DELETE: Disabled if no selection */}
             <MinecraftButton 
               style={{ width: '100px' }} 
               onClick={handleDelete}
               disabled={!selectedId}
             >
               Delete
             </MinecraftButton>
             
             {/* REFRESH: Always Enabled */}
             <MinecraftButton style={{ width: '100px' }} onClick={handleRefresh}>
                {isRefreshing ? "..." : "Refresh"}
             </MinecraftButton>
             
             {/* CANCEL: Always Enabled */}
             <MinecraftButton style={{ width: '100px' }} onClick={onBack}>Cancel</MinecraftButton>
          </div>
        </div>
      }
    >
       {/* --- SERVER LIST --- */}
       <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
         {experiences.map((job) => (
           <ServerSlot 
             key={job.id}
             name={job.name}
             motd={job.role}
             ping={job.ping}
             players={job.status}
             // Ensure this path matches the icons you have in /public/icons/
             icon={job.icon || "/icons/default_server.png"}
             
             // Pass selection state to ServerSlot
             selected={selectedId === job.id} 
             onClick={() => setSelectedId(job.id)}
           />
         ))}
       </div>
    </MinecraftModal>
  );
};

export default Multiplayer;