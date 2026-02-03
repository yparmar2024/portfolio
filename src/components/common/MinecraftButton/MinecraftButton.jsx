/**
 * Minecraft-styled button component
 * 
 * Replicates the classic Minecraft Java Edition button appearance with:
 * - Pixelated texture pattern
 * - 3D bevel effect (inset box-shadow)
 * - Hover state with blue tint
 * - Active state with press-down effect
 * - UI click sound integration
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button label/content
 * @param {Function} props.onClick - Click handler
 * @param {Object} props.style - Additional inline styles
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.muteSound - Disable click sound (for custom sounds)
 */

import styles from './MinecraftButton.module.css';
import useSound from '../../../hooks/useSound';

export default function MinecraftButton({ children, onClick, style, disabled, muteSound }) {
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