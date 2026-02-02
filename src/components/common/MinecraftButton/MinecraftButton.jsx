import { useRef } from 'react';
import styles from './MinecraftButton.module.css';

export default function MinecraftButton({ children, onClick, style, disabled, muteSound }) {
  const audioRef = useRef(new Audio('/sounds/click.ogg'));

  const handleClick = (e) => {
    // 1. Safety check: prevent action if disabled
    if (disabled) return;

    if (!muteSound) {
      const sound = audioRef.current.cloneNode();
      sound.volume = 0.5;
      sound.play().catch(e => console.error("Audio play failed", e));
    }

    if (onClick) onClick(e);
  };

  return (
    // 2. CHANGED: Use <button> instead of <div>
    <button 
      className={styles.btn} 
      onClick={handleClick}
      style={style}
      // 3. CRITICAL: Pass the native disabled attribute so CSS :disabled works
      disabled={disabled} 
    >
      {children}
    </button>
  );
}