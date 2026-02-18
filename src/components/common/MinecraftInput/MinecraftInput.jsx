import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import styles from './MinecraftInput.module.css';

const MinecraftInput = forwardRef(({ 
  value, 
  onChange, 
  onKeyDown,         // Added: Needed for Terminal Enter/Escape
  variant = 'default', // Added: 'default' | 'chat'
  placeholder = "", 
  className = "",
  onFocusChange,
  ...props           // Added: Pass through other props
}, ref) => {
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Allow Parent to call .focus() on this component
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));

  const updateSelection = (e) => {
    if (e.target) {
      setSelection({
        start: e.target.selectionStart,
        end: e.target.selectionEnd
      });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocusChange) onFocusChange(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onFocusChange) onFocusChange(false);
  };

  const handleChange = (e) => {
    onChange(e);
    updateSelection(e);
  };

  const isTextSelected = selection.start !== selection.end;
  const textBefore = value.slice(0, selection.start);
  const selectedText = value.slice(selection.start, selection.end);
  const textAfter = value.slice(selection.end);

  // Apply .chat class if variant is 'chat'
  const variantClass = variant === 'chat' ? styles.chat : '';

  return (
    <div 
      className={`${styles.container} ${variantClass} ${className}`} 
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="text"
        className={styles.hiddenInput}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown} // Pass the key handler down
        onSelect={updateSelection} 
        onFocus={handleFocus}
        onBlur={handleBlur}
        spellCheck="false"
        autoComplete="off"
        {...props}
      />

      <div className={styles.visualText}>
        {value.length === 0 && !isFocused && (
          <span className={styles.placeholder}>{placeholder}</span>
        )}

        <span className={styles.textContent}>
          {textBefore}
          {isTextSelected ? (
             <span className={styles.highlight}>{selectedText}</span>
          ) : (
             isFocused && <span className={styles.cursor}>_</span>
          )}
          {textAfter}
        </span>
      </div>
    </div>
  );
});

export default MinecraftInput;