/**
 * Minecraft-styled modal overlay component
 * 
 * Provides a full-screen modal with:
 * - Dark backdrop with blur effect
 * - Scrollable content area (greyed-out list style)
 * - Custom Minecraft-themed scrollbar
 * - Bottom controls section for buttons
 * 
 * Used for server lists, settings screens, and other modal interfaces.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.title - Modal header text
 * @param {React.ReactNode} props.children - Scrollable content
 * @param {React.ReactNode} props.controls - Bottom button controls
 */

import styles from './MinecraftModal.module.css';

export default function MinecraftModal({ title, children, controls }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.scrollArea}>
          {children}
        </div>

        {controls && (
          <div className={styles.controls}>
            {controls}
          </div>
        )}
      </div>
    </div>
  );
}