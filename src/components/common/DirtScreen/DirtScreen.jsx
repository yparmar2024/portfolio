import React from 'react';
import styles from './DirtScreen.module.css';

const DirtScreen = ({ children }) => {
  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default DirtScreen;