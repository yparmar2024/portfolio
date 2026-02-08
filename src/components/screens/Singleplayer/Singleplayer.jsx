import React, { useState, useEffect, useRef } from 'react';
import ItemSlot from './components/ItemSlot/ItemSlot';
import RecipeBook from './components/RecipeBook/RecipeBook';
import styles from './Singleplayer.module.css';
import itemsData from '../../../data/items.json';
import PlayerPreview from './components/PlayerPreview/PlayerPreview';

// --- PLACEHOLDER ASSETS ---
// Ensure these files exist in public/icons/ui/
const ARMOR_PLACEHOLDERS = {
  39: '/icons/ui/empty_armor_slot_helmet.png',
  38: '/icons/ui/empty_armor_slot_chestplate.png',
  37: '/icons/ui/empty_armor_slot_leggings.png',
  36: '/icons/ui/empty_armor_slot_boots.png'
};

const OFFHAND_PLACEHOLDER = '/icons/ui/empty_armor_slot_shield.png';

const canPlaceItem = (item, slotIndex) => {
  if (!item) return true;
  if (slotIndex <= 35) return true; 
  if (slotIndex >= 36 && slotIndex <= 39) return item.isArmor === true;
  if (slotIndex === 40) return item.isShield === true || item.type === 'tool';
  if (slotIndex >= 41 && slotIndex <= 44) {
    const validCraftingTypes = ['language', 'framework', 'library', 'infrastructure', 'tool'];
    return item.isBlock === true || validCraftingTypes.includes(item.type);
  }
  if (slotIndex === 45) return false;
  return false;
};

const Singleplayer = ({ onClose }) => {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [heldItem, setHeldItem] = useState(null);
  
  // Tooltip & Mouse State
  const [hoveredItem, setHoveredItem] = useState(null);
  const tooltipRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const floatingItemRef = useRef(null);

  const [slots, setSlots] = useState(() => {
    const initial = Array(46).fill(null);

    // --- HOTBAR (Slots 27-35) ---
    if (itemsData.python)      initial[27] = itemsData.python;
    if (itemsData.java)        initial[28] = itemsData.java;
    if (itemsData.cpp)         initial[29] = itemsData.cpp;
    if (itemsData.typescript)  initial[30] = itemsData.typescript;
    if (itemsData.javascript)  initial[31] = itemsData.javascript;
    if (itemsData.sql)         initial[32] = itemsData.sql;
    if (itemsData.react)       initial[33] = itemsData.react;
    if (itemsData.docker)      initial[34] = itemsData.docker;

    // --- ROW 1 (Slots 0-8) ---
    if (itemsData.tensorflow)  initial[0] = itemsData.tensorflow;
    if (itemsData.pytorch)     initial[1] = itemsData.pytorch;
    if (itemsData.keras)       initial[2] = itemsData.keras;
    if (itemsData.scikit_learn) initial[3] = itemsData.scikit_learn;
    if (itemsData.pandas)      initial[4] = itemsData.pandas;
    if (itemsData.numpy)       initial[5] = itemsData.numpy;
    if (itemsData.langchain)   initial[6] = itemsData.langchain;

    // --- ROW 2 (Slots 9-17) ---
    if (itemsData.fastapi)     initial[9] = itemsData.fastapi;
    if (itemsData.nodejs)      initial[10] = itemsData.nodejs;
    if (itemsData.flutter)     initial[11] = itemsData.flutter;

    // --- ROW 3 (Slots 18-26) ---
    if (itemsData.aws_lambda)  initial[18] = itemsData.aws_lambda;
    if (itemsData.dynamodb)    initial[19] = itemsData.dynamodb;
    if (itemsData.s3)          initial[20] = itemsData.s3;
    if (itemsData.aws_ec2)     initial[21] = itemsData.aws_ec2;
    if (itemsData.firebase)    initial[22] = itemsData.firebase;
    if (itemsData.supabase)    initial[23] = itemsData.supabase;

    // --- OFFHAND (Slot 40) ---
    if (itemsData.git)         initial[40] = itemsData.git;

    return initial;
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      // Move Held Item
      if (floatingItemRef.current) {
        floatingItemRef.current.style.left = `${e.clientX}px`;
        floatingItemRef.current.style.top = `${e.clientY}px`;
      }

      // Move Tooltip
      if (tooltipRef.current) {
        // Simple offset to prevent cursor from covering text
        tooltipRef.current.style.left = `${e.clientX + 15}px`;
        tooltipRef.current.style.top = `${e.clientY - 30}px`;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onClose]);

  const handleSlotClick = (index) => {
    // Output Slot Logic (Take Only)
    if (index === 45) {
      if (slots[45] && !heldItem) {
         const newSlots = [...slots];
         setHeldItem(slots[45]);
         newSlots[45] = null;
         setSlots(newSlots);
      }
      return;
    }

    const clickedItem = slots[index];

    // Pick Up
    if (!heldItem && clickedItem) {
      setHeldItem(clickedItem);
      const newSlots = [...slots];
      newSlots[index] = null;
      setSlots(newSlots);
      return;
    }

    // Place or Swap
    if (heldItem) {
      if (!canPlaceItem(heldItem, index)) return;

      const newSlots = [...slots];
      const itemToPickup = newSlots[index]; 

      newSlots[index] = heldItem;
      setHeldItem(itemToPickup); 
      setSlots(newSlots);
    }
  };

  return (
    <div className={styles.overlay}>
      
      {/* --- TOOLTIP --- */}
      {hoveredItem && !heldItem && (
        <div 
          ref={tooltipRef}
          className={styles.tooltip}
          style={{
            left: mousePos.current.x,
            top: mousePos.current.y
          }}
        >
          <span className={styles.tooltipTitle}>{hoveredItem.name}</span>
          {hoveredItem.description && (
            <span className={styles.tooltipDesc}>{hoveredItem.description}</span>
          )}
        </div>
      )}

      {/* --- FLOATING ITEM --- */}
      {heldItem && (
        <div 
          ref={floatingItemRef} 
          className={styles.floatingItem}
          style={{ 
            left: `${mousePos.current.x}px`, 
            top: `${mousePos.current.y}px` 
          }}
        >
          <img src={heldItem.icon} alt="Held Item" />
        </div>
      )}

      <div className={`${styles.container} ${isBookOpen ? styles.bookOpen : ''}`}>
        <div className={styles.topSection}>
          <div className={styles.leftGroup}>
            
            {/* ARMOR COLUMN (Helmet 39 -> Boots 36) */}
            <div className={styles.armorColumn}>
              {[39, 38, 37, 36].map((index) => (
                <ItemSlot 
                  key={index} 
                  item={slots[index]} 
                  index={index} 
                  onSlotClick={handleSlotClick}
                  onHover={setHoveredItem}
                  onLeave={() => setHoveredItem(null)} 
                  placeholder={ARMOR_PLACEHOLDERS[index]}
                />
              ))}
            </div>
            
            <div className={styles.characterPreview}>
              <PlayerPreview isBookOpen={isBookOpen}/>
            </div>
          </div>

          <div className={styles.middleGroup}>
            {/* OFFHAND SLOT */}
            <div className={styles.offhandWrapper}>
               <ItemSlot 
                 item={slots[40]} 
                 index={40} 
                 onSlotClick={handleSlotClick}
                 onHover={setHoveredItem}
                 onLeave={() => setHoveredItem(null)}
                 placeholder={OFFHAND_PLACEHOLDER}
               />
            </div>
            <div className={styles.recipeBookWrapper}>
               <RecipeBook isOpen={isBookOpen} onClick={() => setIsBookOpen(!isBookOpen)} />
            </div>
          </div>

          <div className={styles.craftingGroup}>
            <span className={styles.craftingLabel}>Crafting</span>
            <div className={styles.craftingArea}>
              <div className={styles.craftingGrid2x2}>
                {[41, 42, 43, 44].map((index) => (
                  <ItemSlot 
                    key={index} 
                    item={slots[index]} 
                    index={index} 
                    onSlotClick={handleSlotClick}
                    onHover={setHoveredItem}
                    onLeave={() => setHoveredItem(null)} 
                  />
                ))}
              </div>
              <div className={styles.craftingOutputRow}>
                <div className={styles.arrow} />
                <ItemSlot 
                  item={slots[45]} 
                  index={45} 
                  onSlotClick={handleSlotClick}
                  onHover={setHoveredItem}
                  onLeave={() => setHoveredItem(null)} 
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div className={styles.inventorySection}>
          <div className={styles.grid9x3}>
            {slots.slice(0, 27).map((item, index) => (
              <ItemSlot 
                key={index} 
                item={item} 
                index={index} 
                onSlotClick={handleSlotClick}
                onHover={setHoveredItem}
                onLeave={() => setHoveredItem(null)} 
              />
            ))}
          </div>
          <div className={styles.hotbar9x1}>
            {slots.slice(27, 36).map((item, index) => (
              <ItemSlot 
                key={index + 27} 
                item={item} 
                index={index + 27} 
                onSlotClick={handleSlotClick}
                onHover={setHoveredItem}
                onLeave={() => setHoveredItem(null)} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Singleplayer;