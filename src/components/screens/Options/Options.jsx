/**
 * Options settings screen component.
 *
 * Displays a Minecraft-styled settings panel with four sub-views:
 * - MAIN:           Profile card, jukebox drag-and-drop, video toggle, and navigation
 * - MUSIC:          Master / Music / UI volume sliders
 * - RESOURCE_PACKS: Resume download links (SWE and ML flavors)
 * - CREDITS:        Attribution list rendered from credits.json
 *
 * Jukebox drag-and-drop follows the standard HTML5 DataTransfer API:
 * draggable disc images set `trackId` and `trackLabel` on dragStart;
 * the jukebox drop zone reads those values to call `playTrack`.
 *
 * @component
 * @param {Object}   props
 * @param {Function} props.onBack          - Return to the main menu
 * @param {string}   props.videoSetting    - Current panorama theme ('Auto' | 'Day' | 'Night')
 * @param {Function} props.setVideoSetting - Update panorama theme
 * @param {string}   props.difficulty      - Current difficulty label (display-only)
 * @param {Function} props.setDifficulty   - Locked; triggers an error modal
 */

import React, { useState } from 'react';
import MinecraftModal from '../../common/MinecraftModal/MinecraftModal';
import MinecraftButton from '../../common/MinecraftButton/MinecraftButton';
import DirtScreen from '../../common/DirtScreen/DirtScreen';
import ErrorModal from '../../common/ErrorModal/ErrorModal';
import styles from './Options.module.css';
import { useSoundSettings } from '../../../context/SoundContext';
import { ERROR_MESSAGES } from '../../../utils/errorMessages';
import useErrorModal from '../../../hooks/useErrorModal';

import creditsData from '../../../data/credits.json';

const MUSIC_DISCS = [
  { id: 'sweden',    label: 'C418 - Sweden' },
  { id: 'mice',      label: 'C418 - Mice on Venus' },
  { id: 'otherside', label: 'Lena Raine - Otherside' },
  { id: 'pigstep',   label: 'Lena Raine - Pigstep' },
  { id: 'stal',      label: 'C418 - Stal' },
  { id: 'wait',      label: 'C418 - Wait' }
];

const Options = ({ onBack, videoSetting, setVideoSetting, difficulty }) => {
  const [currentView, setCurrentView] = useState('MAIN');
  const [viewingPdf, setViewingPdf] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const { volume, setVolume, playTrack, currentTrackName } = useSoundSettings();
  const { error, showError, hideError } = useErrorModal();

  const handleVideoToggle = () => {
    if (videoSetting === 'Auto') setVideoSetting('Day');
    else if (videoSetting === 'Day') setVideoSetting('Night');
    else setVideoSetting('Auto');
  };

  const handleDifficulty = () => showError(ERROR_MESSAGES.DIFFICULTY_LOCKED);

  const handleViewPdf = (type) => {
    const fileName = type === 'SWE'
      ? 'Yash_Parmar_Resume_SWE.pdf'
      : 'Yash_Parmar_Resume_ML.pdf';
    setViewingPdf(`/resumes/${fileName}`);
  };

  const handleVolumeChange = (type, value) => {
    setVolume(prev => ({ ...prev, [type]: value }));
  };

  const onDragStart = (e, track) => {
    e.dataTransfer.setData("trackId", track.id);
    e.dataTransfer.setData("trackLabel", track.label);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const id = e.dataTransfer.getData("trackId");
    const label = e.dataTransfer.getData("trackLabel");
    if (id && label) {
      playTrack(`/sounds/${id}.mp3`, label);
    }
  };

  const renderMainOptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%', userSelect: 'none' }}>

      <div style={{ display: 'flex', gap: '15px', width: '100%', height: '200px', alignItems: 'stretch' }}>
        <div style={{
          flex: '0 0 200px', border: '4px solid #000', backgroundColor: '#333',
          display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
        }}>
          <img src="/icons/socials/profile.png" alt="Yash" style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }} />
        </div>

        <div style={{
          flex: 1, padding: '20px', border: '2px solid #555', backgroundColor: 'rgba(0,0,0,0.4)',
          color: '#fff', fontSize: '18px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px'
        }}>
          <div><span style={{ color: '#ffff55' }}>Location:</span> Hoboken, NJ</div>
          <div><span style={{ color: '#ffff55' }}>Server:</span> Stevens Institute of Technology</div>
          <div><span style={{ color: '#ffff55' }}>Current Quest:</span> Summer 2026 Internship</div>
        </div>
      </div>

      <div style={{ display: 'flex', width: '100%', gap: '15px', height: '200px' }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={onDrop}
          style={{
            flex: '0 0 200px',
            border: isDraggingOver ? '4px dashed #ffff55' : '3px solid #555',
            backgroundColor: isDraggingOver ? 'rgba(255,255,85,0.2)' : 'rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <img src="/icons/items/jukebox.png" style={{ width: '100px', imageRendering: 'pixelated' }} alt="jukebox" />
          <div style={{ fontSize: '16px', color: isDraggingOver ? '#ffff55' : '#888', marginTop: '10px' }}>
            {isDraggingOver ? "RELEASE DISC" : "INSERT DISC"}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.5)', padding: '15px', border: '2px solid #333', overflow: 'hidden' }}>
          <div style={{ textAlign: 'left', borderBottom: '2px solid #444', marginBottom: '4px' }}>
            <span style={{ color: '#aaa', fontSize: '14px' }}>NOW PLAYING: </span>
            <div style={{ color: '#ffff55', fontSize: '18px', textShadow: '2px 2px 0 #000' }}>{currentTrackName}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', justifyItems: 'center' }}>
            {MUSIC_DISCS.map((track, i) => (
              <div
                key={track.id}
                draggable
                onDragStart={(e) => onDragStart(e, track)}
                className={styles.disc}
              >
                <img
                  src={`/icons/items/disc_${i + 1}.png`}
                  alt={track.label}
                  style={{ width: '40px', height: '40px', imageRendering: 'pixelated' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '2px', backgroundColor: '#444', margin: '5px 0' }} />

      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <MinecraftButton style={{ flex: 1 }} onClick={handleVideoToggle}>Video: {videoSetting}</MinecraftButton>
        <MinecraftButton style={{ flex: 1 }} onClick={() => setCurrentView('MUSIC')}>Audio Settings...</MinecraftButton>
      </div>
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <MinecraftButton style={{ flex: 1 }} onClick={handleDifficulty}>Difficulty: {difficulty}</MinecraftButton>
        <MinecraftButton style={{ flex: 1 }} onClick={() => setCurrentView('RESOURCE_PACKS')}>Resume Packs...</MinecraftButton>
      </div>
      <MinecraftButton style={{ width: '100%' }} onClick={() => setCurrentView('CREDITS')}>Credits & Attributions...</MinecraftButton>
      <MinecraftButton style={{ width: '200px', marginTop: '5px' }} onClick={onBack}>Done</MinecraftButton>
    </div>
  );

  const renderMusicOptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', width: '100%' }}>
      <div style={{ color: '#aaaaaa', marginBottom: '10px' }}>Music & Sound Options</div>
      <div className={styles.sliderContainer}>
        <div className={styles.label}>Master Volume: {volume.master}%</div>
        <input type="range" min="0" max="100" value={volume.master} onChange={(e) => handleVolumeChange('master', parseInt(e.target.value))} className={styles.rangeInput} />
      </div>
      <div className={styles.sliderContainer}>
        <div className={styles.label}>Music: {volume.music}%</div>
        <input type="range" min="0" max="100" value={volume.music} onChange={(e) => handleVolumeChange('music', parseInt(e.target.value))} className={styles.rangeInput} />
      </div>
      <div className={styles.sliderContainer}>
        <div className={styles.label}>UI Sounds: {volume.ui}%</div>
        <input type="range" min="0" max="100" value={volume.ui} onChange={(e) => handleVolumeChange('ui', parseInt(e.target.value))} className={styles.rangeInput} />
      </div>
      <MinecraftButton style={{ width: '200px', marginTop: '10px' }} onClick={() => setCurrentView('MAIN')}>Done</MinecraftButton>
    </div>
  );

  const renderResourcePacks = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
      <div style={{ color: '#aaaaaa', marginBottom: '5px' }}>Select Resource Pack (Resume)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', border: '2px solid #555', padding: '10px', backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', maxWidth: '320px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/icons/items/command_block.png" alt="SWE" style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ color: '#fff' }}>Software Engineer</div>
            <div style={{ color: '#aaa', fontSize: '12px' }}>Engineering & Architecture</div>
          </div>
          <MinecraftButton style={{ width: '40px', paddingTop: '0px' }} onClick={() => handleViewPdf('SWE')}><span style={{ position: 'relative', top: '-5px' }}>⬇</span></MinecraftButton>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/icons/items/redstone_dust.png" alt="ML" style={{ width: '32px', height: '32px', imageRendering: 'pixelated' }} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ color: '#fff' }}>Machine Learning</div>
            <div style={{ color: '#aaa', fontSize: '12px' }}>Research & Analytics</div>
          </div>
          <MinecraftButton style={{ width: '40px', paddingTop: '0px' }} onClick={() => handleViewPdf('ML')}><span style={{ position: 'relative', top: '-5px' }}>⬇</span></MinecraftButton>
        </div>
      </div>
      <MinecraftButton style={{ width: '200px', marginTop: '15px' }} onClick={() => setCurrentView('MAIN')}>Done</MinecraftButton>
    </div>
  );

  const renderCredits = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      minHeight: '480px',
      paddingBottom: '10px'
    }}>
      <div style={{ color: '#aaaaaa', marginBottom: '10px' }}>Credits & Attributions</div>

      <div style={{
        flex: 1,
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.5)',
        border: '2px solid #555',
        padding: '15px',
        color: '#ffffff',
        fontSize: '14px',
        lineHeight: '1.8',
        textAlign: 'center'
      }}>
        {creditsData.map((section, index) => (
          <div key={index} style={{ marginBottom: index === creditsData.length - 1 ? '0' : '15px' }}>
            <div style={{ color: '#ffff55', marginBottom: '5px' }}>{section.title}</div>
            {section.items.map((item, i) => (
              <div key={i}>{item}</div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <MinecraftButton style={{ width: '200px' }} onClick={() => setCurrentView('MAIN')}>
          Done
        </MinecraftButton>
      </div>
    </div>
  );

  if (viewingPdf) {
    return (
      <DirtScreen>
        <div style={{ fontSize: '20px', color: '#ffffff', marginBottom: '15px' }}>Viewing: {viewingPdf.split('/').pop()}</div>
        <iframe src={viewingPdf} title="Resume Viewer" style={{ width: '90%', height: '75vh', border: '2px solid #000', backgroundColor: '#ffffff', boxShadow: '0px 0px 10px rgba(0,0,0,0.5)' }} />
        <MinecraftButton style={{ width: '200px', marginTop: '20px' }} onClick={() => setViewingPdf(null)}>Done</MinecraftButton>
      </DirtScreen>
    );
  }

  return (
    <>
      {error && <ErrorModal title={error.title} message={error.message} onClose={hideError} />}
      <MinecraftModal title="Options" onClose={onBack}>
        {currentView === 'MAIN'           && renderMainOptions()}
        {currentView === 'MUSIC'          && renderMusicOptions()}
        {currentView === 'RESOURCE_PACKS' && renderResourcePacks()}
        {currentView === 'CREDITS'        && renderCredits()}
      </MinecraftModal>
    </>
  );
};

export default Options;
