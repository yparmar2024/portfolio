import React, { useState, useEffect, useRef } from 'react';
import ItemSlot from './components/ItemSlot/ItemSlot';
import RecipeBook from './components/RecipeBook/RecipeBook';
import RecipeSidebar from './components/RecipeBook/RecipeSidebar';
import styles from './Singleplayer.module.css';
import itemsData from '../../../data/items.json';
import recipesData from '../../../data/recipes.json'; // Needed if we reference recipes directly
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

// --- LOGIC: Can we place item X in slot Y? ---
const canPlaceItem = (item, slotIndex) => {
  if (!item) return true;
  if (slotIndex <= 35) return true; // Inventory/Hotbar
  if (slotIndex >= 36 && slotIndex <= 39) return item.isArmor === true; // Armor
  if (slotIndex === 40) return item.isShield === true || item.type === 'tool'; // Offhand
  if (slotIndex >= 41 && slotIndex <= 44) {
    // Crafting Grid: Allow ingredients
    const validCraftingTypes = ['language', 'framework', 'library', 'infrastructure', 'tool', 'project_item'];
    return item.isBlock === true || validCraftingTypes.includes(item.type);
  }
  if (slotIndex === 45) return false; // Output slot is output-only
  return false;
};

const Singleplayer = ({ onClose }) => {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [heldItem, setHeldItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const tooltipRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const floatingItemRef = useRef(null);

  // Sound Context
  const { getEffectiveVolume } = useSoundSettings();

  // --- INITIALIZE INVENTORY ---
  const [slots, setSlots] = useState(() => {
    const initial = Array(46).fill(null);
    
    // Helper to safely set item if it exists in JSON
    const setItem = (index, id) => {
      if (itemsData[id]) initial[index] = { ...itemsData[id] };
    };

    // --- HOTBAR ---
    setItem(27, 'python');
    setItem(28, 'java');
    setItem(29, 'cpp');
    setItem(30, 'typescript');
    setItem(31, 'javascript');
    setItem(32, 'sql');
    setItem(33, 'react');
    setItem(34, 'docker');

    // --- ROW 1 ---
    setItem(0, 'tensorflow');
    setItem(1, 'pytorch');
    setItem(2, 'keras');
    setItem(3, 'scikit_learn');
    setItem(4, 'pandas');
    setItem(5, 'numpy');
    setItem(6, 'langchain');

    // --- ROW 2 ---
    setItem(9, 'fastapi');
    setItem(10, 'nodejs');
    setItem(11, 'flutter');

    // --- ROW 3 ---
    setItem(18, 'aws_lambda');
    setItem(19, 'dynamodb');
    setItem(20, 's3');
    setItem(21, 'aws_ec2');
    setItem(22, 'firebase');
    setItem(23, 'supabase');

    // --- OFFHAND ---
    setItem(40, 'git');
    
    return initial;
  });

  // --- MOUSE & KEY LISTENERS ---
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
        // Offset tooltip slightly from cursor
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

  // --- HELPER: Play Click Sound ---
  const playUiClick = () => {
    try {
      const audio = new Audio('/sounds/click.ogg');
      audio.volume = getEffectiveVolume('ui'); 
      audio.play().catch(() => {});
    } catch (err) {
      console.warn("Audio error", err);
    }
  };

  // --- HANDLE: Recipe Click (Auto-Fill) ---
  const handleRecipeClick = (recipe) => {
    playUiClick();
    const newSlots = [...slots];

    // 1. Clear Crafting Grid (41-44) and Result (45)
    [41, 42, 43, 44, 45].forEach(i => newSlots[i] = null);

    // 2. Map Ingredients to Grid
    let missingIngredients = false;

    recipe.ingredients.forEach(ing => {
      // Determine Grid Slot (0=41, 1=42, 2=43, 3=44)
      const offset = typeof ing.slot === 'number' ? ing.slot : 0;
      const targetSlot = 41 + offset;

      // Lookup Item Data
      const itemData = itemsData[ing.item];

      if (itemData) {
        // Check if user has this item anywhere in main inventory (0-40)
        const userHasItem = slots.slice(0, 41).some(s => s && s.id === ing.item);

        if (!userHasItem) missingIngredients = true;

        newSlots[targetSlot] = {
          ...itemData,
          count: 1,
          isGhost: !userHasItem // Red Background if missing
        };
      }
    });

    // 3. Set Result (Only if NO ghosts)
    if (!missingIngredients && recipe.result) {
      // If result is an ID string, hydration might be needed, 
      // but recipes.json usually has the full object or we map it here.
      // Assuming recipe.result is the object from JSON:
      newSlots[45] = { ...recipe.result, count: 1 };
    }

    setSlots(newSlots);
  };

  // --- HANDLE: Slot Click (Inventory Management) ---
  const handleSlotClick = (index) => {
    // Output Slot Logic (Crafting Result)
    if (index === 45) {
      if (slots[45] && !heldItem) {
         // Crafting Logic: Check for ghosts
         const hasGhosts = [41, 42, 43, 44].some(i => slots[i] && slots[i].isGhost);
         if (hasGhosts) return; // Cannot craft with ghosts

         const newSlots = [...slots];
         setHeldItem(slots[45]);
         
         // Consume Ingredients (This is "Creative" style, so we just clear grid)
         // In survival we would decrement.
         newSlots[45] = null;
         [41, 42, 43, 44].forEach(i => newSlots[i] = null);
         
         setSlots(newSlots);
         playUiClick();
      }
      return;
    }

    const clickedItem = slots[index];

    // Case 1: Picking up an item
    if (!heldItem && clickedItem) {
      // Don't pick up ghosts
      if (clickedItem.isGhost) {
        // Optional: Clear ghost on click?
        const newSlots = [...slots];
        newSlots[index] = null;
        setSlots(newSlots);
        playUiClick();
        return;
      }

      setHeldItem(clickedItem);
      const newSlots = [...slots];
      newSlots[index] = null;
      setSlots(newSlots);
      playUiClick();
      return;
    }

    // Case 2: Placing/Swapping an item
    if (heldItem) {
      if (!canPlaceItem(heldItem, index)) return;

      const newSlots = [...slots];
      const itemToPickup = newSlots[index]; // Could be null

      newSlots[index] = heldItem;
      setHeldItem(itemToPickup); 
      setSlots(newSlots);
      playUiClick();
    }
  };

  // --- HANDLE: Sidebar Hover (Tooltip proxy) ---
  const handleSidebarHover = (content) => {
    if (typeof content === 'string') {
      setHoveredItem({ name: content, description: null });
    } else {
      setHoveredItem(content);
    }
  };

  return (
    <div className={styles.overlay}>
      
      {/* --- TOOLTIP --- */}
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

      {/* --- FLOATING HELD ITEM --- */}
      {heldItem && (
        <div 
          ref={floatingItemRef} 
          className={styles.floatingItem}
          style={{ left: `${mousePos.current.x}px`, top: `${mousePos.current.y}px` }}
        >
          <img src={heldItem.icon} alt="Held Item" />
        </div>
      )}

      {/* --- CENTER LAYOUT --- */}
      <div className={styles.centerWrapper}>
        
        {/* LEFT: Recipe Sidebar */}
        <RecipeSidebar 
          isOpen={isBookOpen} 
          inventory={slots}
          onRecipeClick={handleRecipeClick}
          onHover={handleSidebarHover} 
          onLeave={() => setHoveredItem(null)}
        />

        {/* RIGHT: Main Inventory Interface */}
        <div className={styles.container}>
          <div className={styles.topSection}>
            
            {/* Armor & Character */}
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

            {/* Offhand & Recipe Book Toggle */}
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
                  onClick={() => {
                    playUiClick();
                    setIsBookOpen(!isBookOpen);
                  }} 
                />
              </div>
            </div>

            {/* Crafting Grid */}
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
                      isGhost={slots[index]?.isGhost} // Pass Ghost Flag
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

          {/* Main Inventory Grid */}
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
            {/* Hotbar */}
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