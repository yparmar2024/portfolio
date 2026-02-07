import React, { useState, useEffect } from 'react';
import ItemSlot from './components/ItemSlot/ItemSlot';
import RecipeBook from './components/RecipeBook/RecipeBook';
import styles from './Singleplayer.module.css';

const Singleplayer = ({ onClose }) => {
  const [isBookOpen, setIsBookOpen] = useState(false);
  
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
      <div className={`${styles.container} ${isBookOpen ? styles.bookOpen : ''}`}>
        
        <div className={styles.topSection}>
          {/* --- LEFT ZONE: Armor & Character --- */}
          <div className={styles.leftGroup}>
            <div className={styles.armorColumn}>
              {[36, 37, 38, 39].map((index) => (
                <ItemSlot key={index} item={slots[index]} index={index} onMoveItem={handleMoveItem} />
              ))}
            </div>
            <div className={styles.characterPreview}>
              {/* Player Model will go here */}
            </div>
          </div>

          {/* --- MIDDLE ZONE: Offhand Slot --- */}
          <div className={styles.middleGroup}>
            <ItemSlot item={slots[40]} index={40} onMoveItem={handleMoveItem} />
          </div>

          {/* --- RIGHT ZONE: Crafting & Recipe Book --- */}
          <div className={styles.craftingGroup}>
            <span className={styles.craftingLabel}>Crafting</span>
            
            <div className={styles.craftingArea}>
              {/* Column containing Grid and Recipe Book (Stacked) */}
              <div className={styles.craftingInputColumn}>
                <div className={styles.craftingGrid2x2}>
                  <ItemSlot item={slots[41]} index={41} onMoveItem={handleMoveItem} />
                  <ItemSlot item={slots[42]} index={42} onMoveItem={handleMoveItem} />
                  <ItemSlot item={slots[43]} index={43} onMoveItem={handleMoveItem} />
                  <ItemSlot item={slots[44]} index={44} onMoveItem={handleMoveItem} />
                </div>
                
                {/* Recipe Book sits below the grid, aligned with it */}
                <div className={styles.recipeBookWrapper}>
                  <RecipeBook isOpen={isBookOpen} onClick={() => setIsBookOpen(!isBookOpen)} />
                </div>
              </div>

              {/* Arrow and Output Slot */}
              <div className={styles.craftingOutputRow}>
                <div className={styles.arrow} />
                <ItemSlot item={slots[45]} index={45} onMoveItem={handleMoveItem} />
              </div>
            </div>
          </div>

        </div>

        <div style={{ flex: 1 }} />

        {/* --- BOTTOM SECTION: Inventory --- */}
        <div className={styles.inventorySection}>
          <div className={styles.grid9x3}>
            {slots.slice(0, 27).map((item, index) => (
              <ItemSlot key={index} item={item} index={index} onMoveItem={handleMoveItem} />
            ))}
          </div>

          <div className={styles.hotbar9x1}>
            {slots.slice(27, 36).map((item, index) => (
              <ItemSlot key={index + 27} item={item} index={index + 27} onMoveItem={handleMoveItem} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Singleplayer;