import styles from './MinecraftModal.module.css';
import MinecraftButton from '../MinecraftButton/MinecraftButton';

export default function MinecraftModal({ title, children, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        
        {/* standard Minecraft centered title */}
        <h2 className={styles.title}>{title}</h2>

        {/* The specific content for this screen */}
        <div className={styles.content}>
          {children}
        </div>

        {/* The standard "Done" button at the bottom */}
        <MinecraftButton onClick={onClose} style={{ width: '200px' }}>
          Done
        </MinecraftButton>
        
      </div>
    </div>
  );
}