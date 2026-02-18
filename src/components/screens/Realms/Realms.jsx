/**
 * Minecraft Realms (Social Links) screen component.
 *
 * Displays social media profiles and contact links as Minecraft Realms entries.
 * Selecting a realm and pressing "Play" opens the corresponding URL in a new tab.
 *
 * Restricted actions (Configure, Renew, Leave, Add) trigger humorous error modals
 * via `useErrorModal` to maintain the in-universe presentation.
 *
 * @component
 * @param {Object}   props
 * @param {Function} props.onBack - Return to main menu
 */

import React from 'react';
import MinecraftModal from '../../common/MinecraftModal/MinecraftModal';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import ServerSlot from '../../common/ServerSlot/ServerSlot';
import ErrorModal from '../../common/ErrorModal/ErrorModal';
import socialsData from '../../../data/socials.json';
import useServerList from '../../../hooks/useServerList';
import useErrorModal from '../../../hooks/useErrorModal';
import { ERROR_MESSAGES } from '../../../utils/errorMessages';
import { createFlexRow, createFlexColumn } from '../../../utils/styleUtils';

const Realms = ({ onBack }) => {
  const {
    items: realms,
    selectedId,
    selectedItem: selectedRealm,
    handleSelect
  } = useServerList(socialsData);

  const { error, showError, hideError } = useErrorModal();

  const handlePlay = () => {
    if (selectedRealm) {
      window.open(selectedRealm.link, '_blank');
    }
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

      <MinecraftModal
        title="Minecraft Realms"
        onClose={onBack}
        controls={
          <div style={createFlexColumn(10)}>
            <div style={createFlexRow(10)}>
              <MinecraftButton style={{ flex: 1 }} onClick={handlePlay} disabled={!selectedId}>
                Play
              </MinecraftButton>
              <MinecraftButton style={{ flex: 1 }} onClick={() => showError(ERROR_MESSAGES.CONFIGURE_REALM)} disabled={!selectedId}>
                Configure
              </MinecraftButton>
              <MinecraftButton style={{ flex: 1 }} onClick={() => showError(ERROR_MESSAGES.LEAVE_REALM)} disabled={!selectedId}>
                Leave Realm
              </MinecraftButton>
            </div>

            <div style={createFlexRow(10)}>
              <MinecraftButton style={{ flex: 1 }} onClick={() => showError(ERROR_MESSAGES.RENEW_REALM)} disabled={!selectedId}>
                Renew
              </MinecraftButton>
              <MinecraftButton style={{ flex: 1 }} onClick={() => showError(ERROR_MESSAGES.ADD_REALM)}>
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
