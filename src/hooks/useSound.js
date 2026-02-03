/**
 * Custom hook for playing UI sound effects
 * 
 * Creates a persistent Audio instance for a given sound file and provides
 * a play function that respects volume settings from SoundContext.
 * 
 * Used for button clicks, menu interactions, and other short sound effects.
 * For background music, use SoundContext's playTrack method instead.
 * 
 * @param {string} url - Path to the sound file
 * @param {string} type - Audio category for volume mixing (default: 'ui')
 * @returns {Function} Play function for the sound effect
 * 
 * @example
 * const playClick = useSound('/sounds/click.ogg', 'ui');
 * playClick(); // Plays the sound at the current volume level
 */

import { useState, useEffect, useCallback } from 'react';
import { useSoundSettings } from '../context/SoundContext';

const useSound = (url, type = 'ui') => {
  const [audio] = useState(new Audio(url));
  const { volume, getEffectiveVolume } = useSoundSettings();

  const syncVolume = useCallback(() => {
    const effectiveVol = getEffectiveVolume(type);
    audio.volume = effectiveVol;
  }, [getEffectiveVolume, type, audio]);

  useEffect(() => {
    syncVolume();
  }, [volume, syncVolume]);

  const play = () => {
    syncVolume();
    audio.currentTime = 0;
    audio.play().catch(e => console.warn("Playback blocked:", e));
  };

  return play;
};

export default useSound;