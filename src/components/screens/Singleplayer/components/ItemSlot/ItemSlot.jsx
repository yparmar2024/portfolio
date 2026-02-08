import React, { useState } from 'react';
import styles from './ItemSlot.module.css';

/**
 * ItemSlot component
 * Handles "Click-to-Carry" interaction and Tooltip reporting.
 */
const ItemSlot = ({ item, index, onSlotClick, onHover, onLeave }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`${styles.slot} ${isHovered ? styles.slotHovered : ''}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (item && onHover) onHover(item); // Report to parent for tooltip
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (onLeave) onLeave(); // Hide tooltip
      }}
      onClick={(e) => {
        e.preventDefault(); // Prevent accidental selection
        onSlotClick(index);
      }}
    >
      {item && (
        <img 
          src={item.icon} 
          alt={item.name} 
          className={styles.itemIcon}
          draggable="false" // Disable native drag so our custom logic takes over
        />
      )}
    </div>
  );
};

export default ItemSlot;