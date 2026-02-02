// src/components/common/MinecraftModal/MinecraftModal.jsx
import styles from './MinecraftModal.module.css';

export default function MinecraftModal({ title, children, controls }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        
        {/* Header */}
        <h2 className={styles.title}>{title}</h2>

        {/* The Scrollable "Greyed Out" List Area */}
        <div className={styles.scrollArea}>
          {children}
        </div>

        {/* The Bottom Button Area */}
        {controls && (
          <div className={styles.controls}>
            {controls}
          </div>
        )}
        
      </div>
    </div>
  );
}