import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SoundContext = createContext();
export const useSoundSettings = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
  const [volume, setVolume] = useState({ master: 50, music: 30, ui: 100 });
  const musicAudio = useRef(new Audio('/sounds/sweden.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState('C418 - Sweden');

  // 1. Keep Volume in Sync
  useEffect(() => {
    const audio = musicAudio.current;
    audio.loop = true;
    
    const masterMult = volume.master / 100;
    const musicMult = volume.music / 100;
    audio.volume = masterMult * musicMult;
  }, [volume]);

  // 2. Start Music with a gentle Fade In
  const startMusic = () => {
    if (isPlaying) return;

    const audio = musicAudio.current;
    const targetVolume = (volume.master / 100) * (volume.music / 100);
    
    audio.volume = 0; 
    audio.play().then(() => {
      setIsPlaying(true);
      let fadeInterval = setInterval(() => {
        if (audio.volume < targetVolume - 0.05) {
          audio.volume += 0.02;
        } else {
          audio.volume = targetVolume;
          clearInterval(fadeInterval);
        }
      }, 100);
    }).catch(err => console.warn("Interaction required to play music"));
  };

  /**
   * Universal Play Function
   * @param {string|File} source - The path string or File object
   * @param {string} name - The display name for the track
   */
  const playTrack = (source, name) => {
    const audio = musicAudio.current;
    audio.pause();
    
    // Use URL.createObjectURL for Files, or string directly for paths
    audio.src = typeof source === 'string' ? source : URL.createObjectURL(source);
    
    audio.load();
    setCurrentTrackName(name);
    
    // Apply current volume levels immediately
    const targetVolume = (volume.master / 100) * (volume.music / 100);
    audio.volume = targetVolume;

    audio.play().then(() => {
        setIsPlaying(true);
    }).catch(e => console.error("Playback failed", e));
  };

  const getEffectiveVolume = (type) => {
    const key = type.toLowerCase();
    return (volume.master / 100) * ((volume[key] ?? 100) / 100);
  };

  return (
    <SoundContext.Provider value={{ 
      volume, 
      setVolume, 
      getEffectiveVolume, 
      startMusic, 
      playTrack,
      currentTrackName
    }}>
      {children}
    </SoundContext.Provider>
  );
};