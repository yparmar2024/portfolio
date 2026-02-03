import React, { useState, useEffect } from 'react';
import ItemSlot from './components/ItemSlot/ItemSlot';
import styles from './Singleplayer.module.css';

const Singleplayer = ({ onClose }) => {
  // 46 slots total: 
  // 0-26: Inv, 27-35: Hotbar, 36-39: Armor, 40: Offhand
  // 41-44: Crafting Input (2x2), 45: Crafting Output
  const [slots, setSlots] = useState(() => {
    const initial = Array(46).fill(null);
    initial[27] = { id: 'python', name: 'Python', icon: '/icons/diamond_ore.png' };
    initial[0] = { id: 'blueprint', name: 'Blueprint', icon: '/icons/blueprint.png' };
    return initial;
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleMoveItem = (fromIndex, toIndex) => {
    const newSlots = [...slots];
    const temp = newSlots[toIndex];
    newSlots[toIndex] = newSlots[fromIndex];
    newSlots[fromIndex] = temp;
    setSlots(newSlots);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        
        <div className={styles.topSection}>
          {/* Left Armor Column */}
          <div className={styles.armorColumn}>
            {[36, 37, 38, 39].map((index) => (
              <ItemSlot 
                key={`armor-${index}`} 
                item={slots[index]} 
                index={index} 
                onMoveItem={handleMoveItem} 
              />
            ))}
          </div>

          <div className={styles.characterPreview}>
            {/* PlayerPreview Component will go here */}
          </div>

          {/* Right Column (Offhand Slot) */}
          <div className={styles.rightColumn}>
            <ItemSlot 
              item={slots[40]} 
              index={40} 
              onMoveItem={handleMoveItem} 
            />
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div className={styles.inventorySection}>
          <div className={styles.grid9x3}>
            {slots.slice(0, 27).map((item, index) => (
              <ItemSlot key={`inv-${index}`} item={item} index={index} onMoveItem={handleMoveItem} />
            ))}
          </div>

          <div className={styles.hotbar9x1}>
            {slots.slice(27, 36).map((item, index) => {
              const actualIndex = index + 27;
              return (
                <ItemSlot key={`hot-${actualIndex}`} item={item} index={actualIndex} onMoveItem={handleMoveItem} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Singleplayer;