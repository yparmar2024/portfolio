import React, { useState, useEffect, useRef, useCallback } from 'react';
import ItemSlot from './components/ItemSlot/ItemSlot';
import RecipeBook from './components/RecipeBook/RecipeBook';
import RecipeSidebar from './components/RecipeBook/RecipeSidebar';
import styles from './Singleplayer.module.css';
import itemsData from '../../../data/items.json';
import recipesData from '../../../data/recipes.json'; 
import PlayerPreview from './components/PlayerPreview/PlayerPreview';
import { useSoundSettings } from '../../../context/SoundContext';

// --- PLACEHOLDER ASSETS ---
const ARMOR_PLACEHOLDERS = {
  39: '/icons/ui/empty_armor_slot_helmet.png',
  38: '/icons/ui/empty_armor_slot_chestplate.png',
  37: '/icons/ui/empty_armor_slot_leggings.png',
  36: '/icons/ui/empty_armor_slot_boots.png'
};

const OFFHAND_PLACEHOLDER = '/icons/ui/empty_armor_slot_shield.png';

// --- PLACEMENT LOGIC ---
const canPlaceItem = (item, slotIndex) => {
  if (!item) return true;
  if (slotIndex <= 35) return true; 
  if (slotIndex >= 36 && slotIndex <= 39) {
     if (!item.isArmor) return false;
     if (slotIndex === 39) return item.armorType === 'helmet';
     if (slotIndex === 38) return item.armorType === 'chestplate';
     if (slotIndex === 37) return item.armorType === 'leggings';
     if (slotIndex === 36) return item.armorType === 'boots';
     return false;
  }
  if (slotIndex === 40) return item.isShield === true;
  if (slotIndex >= 41 && slotIndex <= 44) return item.isBlock || item.isArmor || item.isShield;
  if (slotIndex === 45) return false;
  return false;
};

const Singleplayer = ({ onClose }) => {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [heldItem, setHeldItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const tooltipRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const floatingItemRef = useRef(null);
  const { getEffectiveVolume } = useSoundSettings();

  const [slots, setSlots] = useState(() => {
    const initial = Array(46).fill(null);
    const setItem = (index, id) => {
      if (itemsData[id]) initial[index] = { ...itemsData[id] };
    };

    setItem(27, 'python');
    setItem(28, 'java');
    setItem(29, 'cpp');
    setItem(30, 'typescript');
    setItem(31, 'javascript');
    setItem(32, 'sql');
    setItem(33, 'react');
    setItem(34, 'docker');
    setItem(0, 'tensorflow');
    setItem(1, 'pytorch');
    setItem(2, 'keras');
    setItem(3, 'scikit_learn');
    setItem(4, 'pandas');
    setItem(5, 'numpy');
    setItem(6, 'langchain');
    setItem(9, 'fastapi');
    setItem(10, 'nodejs');
    setItem(11, 'flutter');
    setItem(18, 'aws_lambda');
    setItem(19, 'dynamodb');
    setItem(20, 's3');
    setItem(21, 'aws_ec2');
    setItem(22, 'firebase');
    setItem(23, 'supabase');
    setItem(40, 'git');
    return initial;
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (floatingItemRef.current) {
        floatingItemRef.current.style.left = `${e.clientX}px`;
        floatingItemRef.current.style.top = `${e.clientY}px`;
      }
      if (tooltipRef.current) {
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

  const playUiClick = () => {
    try {
      const audio = new Audio('/sounds/click.ogg');
      audio.volume = getEffectiveVolume('ui'); 
      audio.play().catch(() => {});
    } catch (err) {
      console.warn("Audio error", err);
    }
  };

  const handleSidebarHover = useCallback((content) => {
    if (typeof content === 'string') {
      setHoveredItem({ name: content, description: null });
    } else {
      setHoveredItem(content);
    }
  }, []);

  const handleSidebarLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  // --- HELPER: Refund Grid Items to Inventory ---
  const returnGridToInventory = (currentSlots) => {
    const newSlots = [...currentSlots];
    
    // Priority: Hotbar (27-35) -> Row 3 (18-26) -> Row 2 (9-17) -> Row 1 (0-8)
    const searchOrder = [
      ...Array.from({ length: 9 }, (_, i) => 27 + i),
      ...Array.from({ length: 9 }, (_, i) => 18 + i),
      ...Array.from({ length: 9 }, (_, i) => 9 + i),
      ...Array.from({ length: 9 }, (_, i) => 0 + i)
    ];

    // Check slots 41-44
    for (let i = 41; i <= 44; i++) {
        const item = newSlots[i];
        // Only return REAL items, delete ghosts
        if (item && !item.isGhost) {
            const emptyIndex = searchOrder.find(idx => newSlots[idx] === null);
            if (emptyIndex !== undefined) {
                newSlots[emptyIndex] = item;
            } else {
                console.warn("Inventory full, item lost:", item.name);
            }
        }
        // Always clear grid slot
        newSlots[i] = null;
    }
    // Clear output
    newSlots[45] = null;
    return newSlots;
  };

  const handleBookToggle = () => {
    playUiClick();
    if (isBookOpen) {
        // Closing: refund items
        setSlots(currentSlots => returnGridToInventory(currentSlots));
    }
    setIsBookOpen(!isBookOpen);
  };

  // --- HELPER: Update Result based on Grid ---
  const updateCraftingResult = (currentSlots) => {
    const grid = {
        0: currentSlots[41],
        1: currentSlots[42],
        2: currentSlots[43],
        3: currentSlots[44]
    };

    const match = recipesData.find(recipe => {
        for (let i = 0; i < 4; i++) {
            const ingredient = recipe.ingredients.find(ing => (ing.slot ?? 0) === i);
            const slotItem = grid[i];

            if (ingredient) {
                if (!slotItem || slotItem.id !== ingredient.item) return false;
            } else {
                if (slotItem) return false;
            }
        }
        return true;
    });

    if (match) {
        const fullItem = itemsData[match.result.id] || match.result;
        // Result is ghost if ANY ingredient is ghost
        const hasGhostIngredients = [41, 42, 43, 44].some(i => currentSlots[i] && currentSlots[i].isGhost);
        currentSlots[45] = { ...fullItem, count: 1, isGhost: hasGhostIngredients };
    } else {
        currentSlots[45] = null;
    }

    return currentSlots;
  };

  // --- HANDLER: Recipe Click ---
  const handleRecipeClick = useCallback((recipe) => {
    playUiClick();
    setSlots(currentSlots => {
      // 1. Refund existing grid items
      let newSlots = returnGridToInventory(currentSlots);
      
      // 2. Place new ingredients
      recipe.ingredients.forEach(ing => {
        const offset = typeof ing.slot === 'number' ? ing.slot : 0;
        const targetSlot = 41 + offset;
        const requiredId = ing.item;

        const sourceIndex = newSlots.findIndex((s, idx) => idx <= 40 && s && s.id === requiredId);

        if (sourceIndex !== -1) {
            newSlots[targetSlot] = { ...newSlots[sourceIndex] };
            newSlots[sourceIndex] = null;
        } else {
            const itemData = itemsData[requiredId];
            if (itemData) {
                newSlots[targetSlot] = { ...itemData, isGhost: true };
            }
        }
      });

      // 3. Update Result
      newSlots = updateCraftingResult(newSlots);

      return newSlots;
    });
  }, []);

  // --- HANDLER: Slot Click ---
  const handleSlotClick = (index) => {
    // 1. HANDLE CRAFTING (OUTPUT SLOT 45)
    if (index === 45) {
      if (slots[45] && !heldItem) {
         if (slots[45].isGhost) return; 

         // A. Pick up the Result
         setHeldItem(slots[45]);
         
         // B. Clear the Output Slot
         const newSlots = [...slots];
         newSlots[45] = null;

         // C. REFUND INGREDIENTS (Don't delete them!)
         // We run the helper to move 41-44 back to 0-40
         const slotsAfterRefund = returnGridToInventory(newSlots);
         
         // D. Update State
         // We don't need to updateCraftingResult because the grid is now empty
         setSlots(slotsAfterRefund);
         playUiClick();
      }
      return;
    }

    const clickedItem = slots[index];

    // Pick Up
    if (!heldItem && clickedItem) {
      if (clickedItem.isGhost) {
        let newSlots = [...slots];
        newSlots[index] = null;
        if (index >= 41 && index <= 44) newSlots = updateCraftingResult(newSlots);
        setSlots(newSlots);
        playUiClick();
        return;
      }

      setHeldItem(clickedItem);
      let newSlots = [...slots];
      newSlots[index] = null;
      if (index >= 41 && index <= 44) newSlots = updateCraftingResult(newSlots);
      setSlots(newSlots);
      playUiClick();
      return;
    }

    // Place
    if (heldItem) {
      if (!canPlaceItem(heldItem, index)) return;

      let newSlots = [...slots];
      const itemToPickup = newSlots[index]; 
      
      if (itemToPickup && itemToPickup.isGhost) {
         newSlots[index] = heldItem;
         setHeldItem(null);
      } else {
         newSlots[index] = heldItem;
         setHeldItem(itemToPickup); 
      }
      
      if (index >= 41 && index <= 44) newSlots = updateCraftingResult(newSlots);
      setSlots(newSlots);
      playUiClick();
    }
  };

  return (
    <div className={styles.overlay}>
      {hoveredItem && !heldItem && (
        <div 
          ref={tooltipRef}
          className={styles.tooltip}
          style={{ left: mousePos.current.x, top: mousePos.current.y }}
        >
          <span className={styles.tooltipTitle}>{hoveredItem.name}</span>
          {hoveredItem.description && (
            <span className={styles.tooltipDesc}>{hoveredItem.description}</span>
          )}
        </div>
      )}

      {heldItem && (
        <div 
          ref={floatingItemRef} 
          className={styles.floatingItem}
          style={{ left: `${mousePos.current.x}px`, top: `${mousePos.current.y}px` }}
        >
          <img src={heldItem.icon} alt="Held Item" />
        </div>
      )}

      <div className={styles.centerWrapper}>
        <RecipeSidebar 
          isOpen={isBookOpen} 
          inventory={slots}
          heldItem={heldItem} 
          onRecipeClick={handleRecipeClick}
          onHover={handleSidebarHover} 
          onLeave={handleSidebarLeave}
        />

        <div className={styles.container}>
          <div className={styles.topSection}>
            <div className={styles.leftGroup}>
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
                <RecipeBook 
                  isOpen={isBookOpen} 
                  onClick={handleBookToggle} 
                />
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
                      isGhost={slots[index]?.isGhost} 
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
                    isGhost={slots[45]?.isGhost}
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
    </div>
  );
};

export default Singleplayer;