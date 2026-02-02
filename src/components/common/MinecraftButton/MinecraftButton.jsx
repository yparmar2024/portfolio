// src/components/ui/MinecraftButton.jsx
import { useRef } from 'react';
import styles from './MinecraftButton.module.css';

export default function MinecraftButton({ children, onClick, style, disabled, muteSound }) {
  const audioRef = useRef(new Audio('/sounds/click.ogg'));

  const handleClick = (e) => {
    if (disabled) return;

    // Only play the default click sound if muteSound is NOT true
    if (!muteSound) {
      const sound = audioRef.current.cloneNode();
      sound.volume = 0.5;
      sound.play().catch(e => console.error("Audio play failed", e));
    }

    if (onClick) onClick(e);
  };

  return (
    <div 
      className={styles.btn} 
      onClick={handleClick}
      style={style}
      role="button"
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}