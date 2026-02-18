/**
 * Multiplayer (Work Experience) screen component.
 *
 * Displays professional experience as a Minecraft server list with two views:
 * - LIST:    Modal showing all employers as selectable `ServerSlot` rows
 * - DETAILS: Full-screen `DirtScreen` with role, dates, and description bullets
 *
 * Restricted actions (Add, Edit, Delete) trigger humorous error modals via
 * `useErrorModal` to maintain the in-universe presentation.
 *
 * @component
 * @param {Object}   props
 * @param {Function} props.onBack - Return to main menu
 */

import React, { useState } from 'react';
import MinecraftModal from '../../common/MinecraftModal/MinecraftModal';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import ServerSlot from '../../common/ServerSlot/ServerSlot';
import DirtScreen from '../../common/DirtScreen/DirtScreen';
import ErrorModal from '../../common/ErrorModal/ErrorModal';
import experiencesData from '../../../data/experiences.json';
import useServerList from '../../../hooks/useServerList';
import useErrorModal from '../../../hooks/useErrorModal';
import { ERROR_MESSAGES } from '../../../utils/errorMessages';
import { INFO_BOX_STYLES, createFlexRow, createFlexColumn } from '../../../utils/styleUtils';

const Multiplayer = ({ onBack }) => {
  const [view, setView] = useState('LIST');

  const {
    items: experiences,
    selectedId,
    selectedItem: selectedJob,
    isRefreshing,
    handleRefresh,
    handleSelect
  } = useServerList(experiencesData);

  const { error, showError, hideError } = useErrorModal();

  const handleJoin = () => {
    if (selectedJob) setView('DETAILS');
  };

  const handleDirectConnect = () => {
    const url = selectedJob ? selectedJob.link : 'https://linkedin.com/in/yparmar';
    window.open(url, '_blank');
  };

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
          onClose={hideError}
        />
      )}

      {view === 'DETAILS' && selectedJob ? (
        <DirtScreen>
          <div style={{ fontSize: '24px', color: '#aaaaaa', marginBottom: '5px' }}>{selectedJob.name}</div>
          <div style={{ fontSize: '18px', color: '#ffff55' }}>{selectedJob.role}</div>
          <div style={{ fontSize: '16px', color: '#aaaaaa', marginBottom: '15px' }}>{selectedJob.dates}</div>

          <div style={INFO_BOX_STYLES}>
            {selectedJob.description.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>

          <div style={{ marginTop: '25px', fontSize: '14px', color: '#55ff55', opacity: 0.8 }}>
            Connection established securely.
          </div>

          <div style={{ ...createFlexRow(10), marginTop: '20px', maxWidth: '600px' }}>
            <MinecraftButton style={{ flex: 1 }} onClick={handleDirectConnect}>Direct Connect</MinecraftButton>
            <MinecraftButton style={{ flex: 1 }} onClick={() => setView('LIST')}>Back to Server List</MinecraftButton>
          </div>
        </DirtScreen>
      ) : (
        <MinecraftModal
          title="Play Multiplayer"
          onClose={onBack}
          controls={
            <div style={createFlexColumn(10)}>
              <div style={createFlexRow(10)}>
                <MinecraftButton style={{ flex: 1 }} onClick={handleJoin} disabled={!selectedId}>Join Server</MinecraftButton>
                <MinecraftButton style={{ flex: 1 }} onClick={handleDirectConnect} disabled={!selectedId}>Direct Connect</MinecraftButton>
                <MinecraftButton style={{ flex: 1 }} onClick={() => showError(ERROR_MESSAGES.ADD_SERVER)}>Add Server</MinecraftButton>
              </div>

              <div style={createFlexRow(10)}>
                <MinecraftButton style={{ flex: 1 }} onClick={() => showError(ERROR_MESSAGES.EDIT_SERVER)} disabled={!selectedId}>Edit</MinecraftButton>
                <MinecraftButton style={{ flex: 1 }} onClick={() => showError(ERROR_MESSAGES.DELETE_SERVER)} disabled={!selectedId}>Delete</MinecraftButton>
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
