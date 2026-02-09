import React from 'react';
import DirtScreen from '../../common/DirtScreen/DirtScreen';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import patchNotes from '../../../data/patchNotes.json'; 
import styles from './Playbook.module.css';

const Playbook = ({ onClose }) => {
  return (
    <DirtScreen>
      <div className={styles.container}>
        <h1 className={styles.header}>Portfolio Playbook</h1>
        
        <div className={styles.list}>
          {patchNotes.map((note) => (
            <div key={note.version} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.version}>{note.version}</span>
                <span className={styles.date}>{note.date}</span>
              </div>
              <h2 className={styles.entryTitle}>{note.title}</h2>
              <ul className={styles.changeList}>
                {note.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.buttonWrapper}>
          <MinecraftButton onClick={onClose} style={{ width: '200px' }}>
            Done
          </MinecraftButton>
        </div>
      </div>
    </DirtScreen>
  );
};

export default Playbook;