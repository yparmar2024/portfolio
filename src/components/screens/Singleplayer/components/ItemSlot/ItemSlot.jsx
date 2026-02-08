import React, { useState } from 'react';
import styles from './ItemSlot.module.css';

const ItemSlot = ({ item, index, onSlotClick, onHover, onLeave, placeholder }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`${styles.slot} ${isHovered ? styles.slotHovered : ''}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (item && onHover) onHover(item);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (onLeave) onLeave();
      }}
      onClick={(e) => {
        e.preventDefault();
        onSlotClick(index);
      }}
    >
      {/* 1. RENDER PLACEHOLDER IF NO ITEM */}
      {!item && placeholder && (
        <img 
          src={placeholder} 
          alt="Slot placeholder" 
          className={styles.placeholderIcon} // New CSS class needed
          draggable="false"
        />
      )}

      {/* 2. RENDER ACTUAL ITEM */}
      {item && (
        <img 
          src={item.icon} 
          alt={item.name} 
          className={styles.itemIcon}
          draggable="false" 
        />
      )}
    </div>
  );
};

export default ItemSlot;