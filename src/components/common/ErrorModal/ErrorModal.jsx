import React from 'react';
import MinecraftButton from '../MinecraftButton/MinecraftButton';
import styles from './ErrorModal.module.css';

const ErrorModal = ({ title, message, onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* Stop click propagation so clicking inside the box doesn't close it */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Title */}
        <div className={styles.title}>{title}</div>

        {/* Black Message Box */}
        <div className={styles.messageBox}>
          {message}
        </div>

        {/* Close Button */}
        <div className={styles.footer}>
          <MinecraftButton 
            style={{ width: '100%', height: '40px' }} 
            onClick={onClose}
          >
            Close
          </MinecraftButton>
        </div>

      </div>
    </div>
  );
};

export default ErrorModal;