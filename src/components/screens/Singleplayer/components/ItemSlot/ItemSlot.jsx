import React, { useState } from 'react';
import styles from './ItemSlot.module.css';

/**
 * @param {Object} item - The item object { id, icon, name }
 * @param {number} index - The unique position of this slot
 * @param {Function} onMoveItem - Callback to handle moving items between slots
 */
const ItemSlot = ({ item, index, onMoveItem }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragStart = (e) => {
    // Store the source index in the dataTransfer object
    e.dataTransfer.setData('sourceIndex', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow a drop
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const sourceIndex = e.dataTransfer.getData('sourceIndex');
    
    // Only trigger move if dropping on a different slot
    if (sourceIndex !== index.toString()) {
      onMoveItem(parseInt(sourceIndex), index);
    }
  };

  return (
    <div 
      className={`${styles.slot} ${isOver ? styles.slotHovered : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {item && (
        <img 
          src={item.icon} 
          alt={item.name} 
          className={styles.itemIcon}
          draggable
          onDragStart={handleDragStart}
        />
      )}
    </div>
  );
};

export default ItemSlot;