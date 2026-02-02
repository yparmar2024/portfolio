// src/hooks/useSound.js
import { useRef, useEffect } from 'react';

export default function useSound(path, volume = 1.0) {
  // Create the audio object once
  const audioRef = useRef(new Audio(path));

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const play = () => {
    // Clone node allows overlapping sounds (spam-clicking)
    // catch handles potential "user didn't interact with document" errors
    const sound = audioRef.current.cloneNode();
    sound.volume = volume;
    sound.play().catch(e => console.error("Audio play failed", e));
  };

  return play;
}