import React, { useEffect, useRef, useState } from 'react';
import { useTerminal } from '../../../context/TerminalContext';
import MinecraftInput from '../MinecraftInput/MinecraftInput';
import styles from './TerminalScreen.module.css';

const TerminalScreen = ({ onClose }) => {
  const { history, executeCommand } = useTerminal();
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef(null);
  
  // Auto-scroll to bottom of history
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* 1. Chat History Area */}
      <div className={styles.historyContainer} onClick={(e) => e.stopPropagation()}>
        {history.map((line, i) => (
          <div key={i} className={`${styles.line} ${styles[line.type]}`}>
            {line.type === 'command' ? (
              <span>{'>'} {line.content}</span>
            ) : (
              <span>{line.content}</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 2. Minecraft Input Bar */}
      <div className={styles.inputWrapper} onClick={(e) => e.stopPropagation()}>
        <MinecraftInput
          variant="chat"   // <--- This triggers the CSS class we just fixed
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          autoFocus={true}
        />
      </div>
    </div>
  );
};

export default TerminalScreen;