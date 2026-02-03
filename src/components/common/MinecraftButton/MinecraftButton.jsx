import styles from './MinecraftButton.module.css';
import useSound from '../../../hooks/useSound';

export default function MinecraftButton({ children, onClick, style, disabled, muteSound }) {
  // Pass 'ui' as the type
  const playClick = useSound('/sounds/click.ogg', 'ui');

  const handleClick = (e) => {
    if (disabled) return;
    
    if (!muteSound) {
      playClick(); 
    }

    if (onClick) onClick(e);
  };

  return (
    <button 
      className={styles.btn} 
      onClick={handleClick}
      style={style}
      disabled={disabled} 
    >
      {children}
    </button>
  );
}