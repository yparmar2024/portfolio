import React, { useState } from 'react';
import styles from './ItemSlot.module.css';

// Added className prop
const ItemSlot = ({ item, index, onSlotClick, onHover, onLeave, placeholder, isGhost, className }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      // Merge default styles with your custom class
      className={`${styles.slot} ${isHovered ? styles.slotHovered : ''} ${isGhost ? styles.ghostItem : ''} ${className || ''}`}
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
        if (onSlotClick) onSlotClick(index);
      }}
    >
      {!item && placeholder && (
        <img 
          src={placeholder} 
          alt="Slot placeholder" 
          className={styles.placeholderIcon}
          draggable="false"
        />
      )}

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