/**
 * Convenience hook for UI click sounds
 *
 * Thin wrapper around useSound with sensible defaults for click interactions.
 * Automatically plays at UI volume level with proper global volume mixing.
 *
 * @returns {Function} Click sound player function
 *
 * @example
 * const playClick = useClickSound();
 *
 * <button onClick={playClick}>Click Me</button>
 */
import useSound from './useSound';

const useClickSound = () => {
  return useSound('/sounds/click.ogg', 'ui');
};

export default useClickSound;
