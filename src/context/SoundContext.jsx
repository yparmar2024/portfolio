/**
 * Sound Context Provider
 * 
 * Centralized audio management system for the Minecraft-themed portfolio.
 * Handles background music playback, volume control (master/music/UI), and dynamic track switching.
 * 
 * Features:
 * - Volume mixing (master × category = effective volume)
 * - Fade-in on music start to avoid jarring audio
 * - Support for both file paths and File objects (drag-and-drop jukebox)
 * - Respects browser autoplay policies
 * 
 * @module SoundContext
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SoundContext = createContext();

/**
 * Hook to access sound settings and controls
 * @returns {Object} Sound context value
 */
export const useSoundSettings = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
  const [volume, setVolume] = useState({ master: 50, music: 30, ui: 100 });
  const musicAudio = useRef(new Audio('/sounds/sweden.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackName, setCurrentTrackName] = useState('C418 - Sweden');

  useEffect(() => {
    const audio = musicAudio.current;
    audio.loop = true;
    
    const masterMult = volume.master / 100;
    const musicMult = volume.music / 100;
    audio.volume = masterMult * musicMult;
  }, [volume]);

  /**
   * Initiates music playback with fade-in effect
   * Handles browser autoplay restrictions gracefully
   */
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
   * Switches to a new music track (jukebox functionality)
   * 
   * @param {string|File} source - File path or File object
   * @param {string} name - Display name for the track
   */
  const playTrack = (source, name) => {
    const audio = musicAudio.current;
    audio.pause();
    
    audio.src = typeof source === 'string' ? source : URL.createObjectURL(source);
    
    audio.load();
    setCurrentTrackName(name);
    
    const targetVolume = (volume.master / 100) * (volume.music / 100);
    audio.volume = targetVolume;

    audio.play().then(() => {
        setIsPlaying(true);
    }).catch(e => console.error("Playback failed", e));
  };

  /**
   * Calculates effective volume for a given audio type
   * 
   * @param {string} type - Audio category (ui, music, etc.)
   * @returns {number} Effective volume (0-1)
   */
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