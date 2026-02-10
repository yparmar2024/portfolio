/**
 * Item Slot component
 *
 * Represents a single inventory slot in the Minecraft-style UI.
 * Displays items, placeholders, handles hover states, and supports ghost items.
 *
 * @component
 * @param {Object} props
 * @param {Object|null} props.item - Item object to display in slot
 * @param {number} props.index - Slot index in inventory array
 * @param {Function} props.onSlotClick - Handler for slot click events
 * @param {Function} props.onHover - Handler for item hover events
 * @param {Function} props.onLeave - Handler for hover leave events
 * @param {string} props.placeholder - Placeholder image URL for empty slot
 * @param {boolean} props.isGhost - Whether item is a ghost (missing ingredient)
 * @param {string} props.className - Additional CSS class for styling
 * @returns {JSX.Element} Inventory slot with item or placeholder
 */
import React, { useState } from 'react';
import styles from './ItemSlot.module.css';

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