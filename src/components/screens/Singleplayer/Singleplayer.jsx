import React, { useState, useEffect, useRef, useCallback } from 'react';
import ItemSlot from './components/ItemSlot/ItemSlot';
import RecipeBook from './components/RecipeBook/RecipeBook';
import RecipeSidebar from './components/RecipeBook/RecipeSidebar';
import styles from './Singleplayer.module.css';
import itemsData from '../../../data/items.json';
import recipesData from '../../../data/recipes.json'; 
import PlayerPreview from './components/PlayerPreview/PlayerPreview';
import { useSoundSettings } from '../../../context/SoundContext';

// 1. DEFINE YOUR ACHIEVEMENTS MAP
// FIX: Keys updated to match items.json "id" fields exactly
const PROJECT_ACHIEVEMENTS = {
  'recrootly': {
    title: 'Recrootly AI',
    desc: 'Automated Recruitment Platform',
    link: 'https://recrootly.vercel.app'
  },
  'nudge_ai': {
    title: 'Nudge AI',
    desc: 'Higher Manager Nudge Assistant',
    link: 'https://qpulse.tech'
  },
  'blueprint_rag': {
    title: 'Blueprint RAG',
    desc: 'Internal Assistant for Documentation via RAG',
    link: 'https://sitblueprint.com'
  },
  'twitter_nlp': {
     title: 'Hate Speech Detector',
     desc: 'NLP Sentiment Analysis',
     link: 'https://github.com/yparmar2024/Data-Glacier'
  }
};

const ARMOR_PLACEHOLDERS = {
  39: '/icons/ui/empty_armor_slot_helmet.png',
  38: '/icons/ui/empty_armor_slot_chestplate.png',
  37: '/icons/ui/empty_armor_slot_leggings.png',
  36: '/icons/ui/empty_armor_slot_boots.png'
};

const OFFHAND_PLACEHOLDER = '/icons/ui/empty_armor_slot_shield.png';

const ACTIVE_EFFECTS = [
  { id: 'grinding', name: 'Grinding IV', duration: '∞:∞:∞', icon: '/icons/items/netherite_pickaxe.png' },
  { id: 'coffee', name: 'Caffeinated II', duration: 'Past Hour', icon: '/icons/items/milk.png' },
  { id: 'bugs', name: 'Merge Conflict I', duration: 'Until Production', icon: '/icons/items/withered.png' }
];

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
  return false;
};

const Singleplayer = ({ onClose }) => {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [heldItem, setHeldItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Achievement State
  const [activeAchievement, setActiveAchievement] = useState(null);
  const [craftedHistory, setCraftedHistory] = useState(new Set());
  
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

  const returnGridToInventory = (currentSlots) => {
    const newSlots = [...currentSlots];
    const searchOrder = [
      ...Array.from({ length: 9 }, (_, i) => 27 + i),
      ...Array.from({ length: 9 }, (_, i) => 18 + i),
      ...Array.from({ length: 9 }, (_, i) => 9 + i),
      ...Array.from({ length: 9 }, (_, i) => 0 + i)
    ];

    for (let i = 41; i <= 44; i++) {
        const item = newSlots[i];
        if (item && !item.isGhost) {
            const emptyIndex = searchOrder.find(idx => newSlots[idx] === null);
            if (emptyIndex !== undefined) newSlots[emptyIndex] = item;
        }
        newSlots[i] = null;
    }
    newSlots[45] = null;
    return newSlots;
  };

  const handleBookToggle = () => {
    playUiClick();
    if (isBookOpen) setSlots(currentSlots => returnGridToInventory(currentSlots));
    setIsBookOpen(!isBookOpen);
  };

  const updateCraftingResult = (currentSlots) => {
    const grid = { 0: currentSlots[41], 1: currentSlots[42], 2: currentSlots[43], 3: currentSlots[44] };
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
        const hasGhostIngredients = [41, 42, 43, 44].some(i => currentSlots[i] && currentSlots[i].isGhost);
        currentSlots[45] = { ...fullItem, count: 1, isGhost: hasGhostIngredients };
    } else {
        currentSlots[45] = null;
    }
    return currentSlots;
  };

  const handleRecipeClick = useCallback((recipe) => {
    playUiClick();
    setSlots(currentSlots => {
      let newSlots = returnGridToInventory(currentSlots);
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
            if (itemData) newSlots[targetSlot] = { ...itemData, isGhost: true };
        }
      });
      return updateCraftingResult(newSlots);
    });
  }, []);

  const handleSlotClick = (index) => {
    if (index === 45) {
      if (slots[45] && !heldItem) {
         if (slots[45].isGhost) return; 

         // --- ACHIEVEMENT LOGIC ---
         const craftedItem = slots[45];
         // DEBUG: Uncomment if still having issues
         // console.log("Crafting Item ID:", craftedItem.id);

         // Check if it's a project item AND we haven't crafted it before
         if (PROJECT_ACHIEVEMENTS[craftedItem.id] && !craftedHistory.has(craftedItem.id)) {
            // Trigger Achievement
            const achData = PROJECT_ACHIEVEMENTS[craftedItem.id];
            setActiveAchievement({ ...achData, icon: craftedItem.icon });
            // Mark as crafted
            setCraftedHistory(prev => {
                const newSet = new Set(prev);
                newSet.add(craftedItem.id);
                return newSet;
            });
            // Auto-hide after 4 seconds
            setTimeout(() => setActiveAchievement(null), 4000);
         }
         // -------------------------

         setHeldItem(slots[45]);
         const newSlots = [...slots];
         newSlots[45] = null;
         setSlots(returnGridToInventory(newSlots));
         playUiClick();
      }
      return;
    }
    const clickedItem = slots[index];
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
      
      {/* 1. ACHIEVEMENT TOAST */}
      {activeAchievement && (
        <div 
          className={styles.achievementContainer}
          onClick={() => window.open(activeAchievement.link, '_blank')}
        >
          <img src={activeAchievement.icon} className={styles.achievementIcon} alt="Icon" />
          <div className={styles.achievementText}>
            <span className={styles.achievementTitle}>New Achievement!</span>
            <span className={styles.achievementName}>{activeAchievement.title}</span>
            <span className={styles.achievementLink}>View Project</span>
          </div>
        </div>
      )}

      {/* 2. ESC HINT */}
      <div className={styles.escHint}>Press 'ESC' to Close</div>

      {/* 3. TOOLTIP */}
      {hoveredItem && !heldItem && (
        <div ref={tooltipRef} className={styles.tooltip}>
          <span className={styles.tooltipTitle}>{hoveredItem.name}</span>
          {hoveredItem.description && <span className={styles.tooltipDesc}>{hoveredItem.description}</span>}
        </div>
      )}

      {heldItem && (
        <div ref={floatingItemRef} className={styles.floatingItem}>
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
                    key={index} item={slots[index]} index={index} 
                    onSlotClick={handleSlotClick} onHover={setHoveredItem}
                    onLeave={() => setHoveredItem(null)} placeholder={ARMOR_PLACEHOLDERS[index]}
                  />
                ))}
              </div>
              <div className={styles.characterPreview}>
                <PlayerPreview isBookOpen={isBookOpen} slots={slots}/>
              </div>
            </div>

            <div className={styles.middleGroup}>
              <div className={styles.offhandWrapper}>
                <ItemSlot 
                  item={slots[40]} index={40} onSlotClick={handleSlotClick}
                  onHover={setHoveredItem} onLeave={() => setHoveredItem(null)}
                  placeholder={OFFHAND_PLACEHOLDER}
                />
              </div>
              <div className={styles.recipeBookWrapper}>
                <RecipeBook isOpen={isBookOpen} onClick={handleBookToggle} />
              </div>
            </div>

            <div className={styles.craftingGroup}>
              <span className={styles.craftingLabel}>Crafting</span>
              <div className={styles.craftingArea}>
                <div className={styles.craftingGrid2x2}>
                  {[41, 42, 43, 44].map((index) => (
                    <ItemSlot 
                      key={index} item={slots[index]} index={index} 
                      onSlotClick={handleSlotClick} onHover={setHoveredItem}
                      onLeave={() => setHoveredItem(null)} isGhost={slots[index]?.isGhost} 
                    />
                  ))}
                </div>
                <div className={styles.craftingOutputRow}>
                  <div className={styles.arrow} />
                  <ItemSlot 
                    item={slots[45]} index={45} onSlotClick={handleSlotClick}
                    onHover={setHoveredItem} onLeave={() => setHoveredItem(null)} 
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
                <ItemSlot key={index} item={item} index={index} onSlotClick={handleSlotClick} onHover={setHoveredItem} onLeave={() => setHoveredItem(null)} />
              ))}
            </div>
            <div className={styles.hotbar9x1}>
              {slots.slice(27, 36).map((item, index) => (
                <ItemSlot key={index + 27} item={item} index={index + 27} onSlotClick={handleSlotClick} onHover={setHoveredItem} onLeave={() => setHoveredItem(null)} />
              ))}
            </div>
          </div>
        </div>

        {/* --- STATUS EFFECTS --- */}
        <div className={styles.effectsContainer}>
          {ACTIVE_EFFECTS.map((effect) => (
            <div 
              key={effect.id}
              className={styles.effectIconSquare}
              onMouseEnter={() => setHoveredItem({ name: effect.name, description: effect.duration })}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <img src={effect.icon} alt={effect.name} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Singleplayer;