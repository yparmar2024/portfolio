import { useState, useEffect, useCallback } from 'react';
import { useSoundSettings } from '../context/SoundContext';

const useSound = (url, type = 'ui') => {
  // Use a state-managed audio object
  const [audio] = useState(new Audio(url));
  const { volume, getEffectiveVolume } = useSoundSettings();

  // Stable function to calculate and apply volume
  const syncVolume = useCallback(() => {
    const effectiveVol = getEffectiveVolume(type);
    audio.volume = effectiveVol;
  }, [getEffectiveVolume, type, audio]);

  // Sync volume immediately when the global 'volume' state changes
  useEffect(() => {
    syncVolume();
  }, [volume, syncVolume]);

  const play = () => {
    // Final sync before playing
    syncVolume();
    audio.currentTime = 0;
    audio.play().catch(e => console.warn("Playback blocked:", e));
  };

  return play;
};

export default useSound;