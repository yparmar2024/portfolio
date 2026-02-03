/**
 * Minecraft-themed error dialog component
 * 
 * Displays humorous error messages in the style of Minecraft's grey UI windows.
 * Features:
 * - Grey beveled container with pixelated aesthetic
 * - Black message box with white text (classic terminal style)
 * - Click-outside-to-close behavior
 * 
 * @component
 * @param {Object} props
 * @param {string} props.title - Error dialog title
 * @param {string} props.message - Error message (supports \n newlines)
 * @param {Function} props.onClose - Close handler
 */

import React from 'react';
import MinecraftButton from '../MinecraftButton/MinecraftButton';
import styles from './ErrorModal.module.css';

const ErrorModal = ({ title, message, onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>{title}</div>

        <div className={styles.messageBox}>
          {message}
        </div>

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