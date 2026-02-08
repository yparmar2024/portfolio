import React, { useState } from 'react';
import styles from './ItemSlot.module.css';

/**
 * ItemSlot component
 * Now purely handles clicks for the "Click-to-Carry" interaction.
 */
const ItemSlot = ({ item, index, onSlotClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`${styles.slot} ${isHovered ? styles.slotHovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Left click triggers the interaction
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