/**
 * Singleplayer experience screen — Minecraft inventory UI.
 *
 * Presents skills as craftable items arranged across a 46-slot inventory:
 *   Slots 0–26:  Main inventory (9×3 grid)
 *   Slots 27–35: Hotbar
 *   Slots 36–39: Armor (boots → helmet, bottom to top)
 *   Slot 40:     Offhand (git shield)
 *   Slots 41–44: 2×2 crafting input
 *   Slot 45:     Crafting output (read-only — clicking collects the result)
 *
 * Crafting a project item for the first time triggers an achievement toast
 * that links to the live project URL.
 *
 * Keyboard shortcuts:
 *   T      → open in-game terminal
 *   Escape → return to main menu (or close terminal if open)
 *
 * @component
 * @param {Object}   props
 * @param {Function} props.onClose - Return to main menu
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ItemSlot from './components/ItemSlot/ItemSlot';
import RecipeBook from './components/RecipeBook/RecipeBook';
import RecipeSidebar from './components/RecipeBook/RecipeSidebar';
import TerminalScreen from '../../common/TerminalScreen/TerminalScreen';
import styles from './Singleplayer.module.css';
import itemsData from '../../../data/items.json';
import recipesData from '../../../data/recipes.json';
import PlayerPreview from './components/PlayerPreview/PlayerPreview';
import useSound from '../../../hooks/useSound';
import useTooltip from '../../../hooks/useTooltip';
import { canPlaceItemInSlot } from '../../../utils/inventoryRules';

/**
 * Maps crafted project item IDs to their public-facing achievement metadata.
 * The achievement toast becomes clickable, opening the live project URL.
 */
const PROJECT_ACHIEVEMENTS = {
  'morf': {
    title: 'Morf',
    desc: '3D Mesh Merge Driver',
    link: 'https://github.com/yparmar2024/morf'
  },
  'graphos': {
    title: 'Graphos',
    desc: 'Agentic Pentesting',
    link: 'https://github.com/yparmar2024/graphos'
  },
  'sleepyu': {
    title: 'SleepyU',
    desc: '8-Bit CPU',
    link: 'https://github.com/yparmar2024/sleepyu'
  },
  'stevens_rmp': {
    title: 'Stevens RMP',
    desc: 'RateMyProfessor Chrome Extension',
    link: 'https://github.com/yparmar2024/stevensrmp'
  }
};

/**
 * Placeholder icons for empty armor slots, keyed by slot index.
 * Mirrors Minecraft's vanilla UI silhouettes.
 */
const ARMOR_PLACEHOLDERS = {
  39: '/icons/ui/empty_armor_slot_helmet.png',
  38: '/icons/ui/empty_armor_slot_chestplate.png',
  37: '/icons/ui/empty_armor_slot_leggings.png',
  36: '/icons/ui/empty_armor_slot_boots.png'
};

const OFFHAND_PLACEHOLDER = '/icons/ui/empty_armor_slot_shield.png';

/**
 * Persistent status effects displayed alongside the inventory,
 * representing the user's current "buffs" in real life.
 */
const ACTIVE_EFFECTS = [
  { id: 'grinding',  name: 'Grinding IV',      duration: '∞:∞:∞',           icon: '/icons/items/netherite_pickaxe.png' },
  { id: 'coffee',    name: 'Caffeinated II',    duration: 'Past Hour',        icon: '/icons/items/milk.png' },
  { id: 'bugs',      name: 'Merge Conflict I',  duration: 'Until Production', icon: '/icons/items/withered.png' }
];

const Singleplayer = ({ onClose }) => {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [heldItem, setHeldItem] = useState(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [activeAchievement, setActiveAchievement] = useState(null);
  const [craftedHistory, setCraftedHistory] = useState(new Set());

  const { hoveredItem, tooltipRef, handleHover, handleLeave } = useTooltip();
  const floatingItemRef = useRef(null);
  const playUiClick = useSound('/sounds/click.ogg', 'ui');

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
    setItem(0,  'tensorflow');
    setItem(1,  'pytorch');
    setItem(2,  'keras');
    setItem(3,  'scikit_learn');
    setItem(4,  'pandas');
    setItem(5,  'numpy');
    setItem(6,  'langchain');
    setItem(9,  'fastapi');
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
      if (isTerminalOpen) return;
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

      if (event.key === 'Escape') {
        onClose();
      }

      if ((event.key === 't' || event.key === 'T') && !heldItem) {
        setIsTerminalOpen(true);
        event.preventDefault();
      }
    };

    const handleMouseMove = (e) => {
      if (floatingItemRef.current) {
        floatingItemRef.current.style.left = `${e.clientX}px`;
        floatingItemRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onClose, isTerminalOpen, heldItem]);

  const handleSidebarHover = useCallback((content) => {
    if (typeof content === 'string') {
      handleHover({ name: content, description: null });
    } else {
      handleHover(content);
    }
  }, [handleHover]);

  /**
   * Returns any non-ghost items sitting in the crafting grid (slots 41–44)
   * back to the first available inventory or hotbar slot, then clears the
   * grid and output slot. Called when the recipe book is closed or a new
   * recipe is loaded.
   */
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

  /**
   * Compares the current crafting grid against every recipe and populates
   * slot 45 with the result (or clears it if no match). Ghost items in the
   * grid produce a ghost output to signal missing ingredients.
   */
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

  /**
   * Populates the 2×2 crafting grid from a recipe sidebar selection.
   * Items found in inventory are moved to the grid; missing items appear
   * as ghost (semi-transparent red) placeholders.
   */
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

        const craftedItem = slots[45];
        if (PROJECT_ACHIEVEMENTS[craftedItem.id] && !craftedHistory.has(craftedItem.id)) {
          const achData = PROJECT_ACHIEVEMENTS[craftedItem.id];
          setActiveAchievement({ ...achData, icon: craftedItem.icon });
          setCraftedHistory(prev => {
            const newSet = new Set(prev);
            newSet.add(craftedItem.id);
            return newSet;
          });
          setTimeout(() => setActiveAchievement(null), 4000);
        }

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
      if (!canPlaceItemInSlot(heldItem, index)) return;
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

  useEffect(() => {
    if (!activeAchievement) return;
    const id = setTimeout(() => setActiveAchievement(null), 4000);
    return () => clearTimeout(id);
  }, [activeAchievement]);

  return (
    <div className={styles.overlay}>
      {isTerminalOpen && <TerminalScreen onClose={() => setIsTerminalOpen(false)} />}

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

      <div className={styles.escHint}>Press 'ESC' to Close | 'T' for Terminal</div>

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
          onLeave={handleLeave}
        />

        <div className={styles.container}>
          <div className={styles.topSection}>
            <div className={styles.leftGroup}>
              <div className={styles.armorColumn}>
                {[39, 38, 37, 36].map((index) => (
                  <ItemSlot
                    key={index} item={slots[index]} index={index}
                    onSlotClick={handleSlotClick} onHover={handleHover}
                    onLeave={handleLeave} placeholder={ARMOR_PLACEHOLDERS[index]}
                  />
                ))}
              </div>
              <div className={styles.characterPreview}>
                <PlayerPreview isBookOpen={isBookOpen} slots={slots} />
              </div>
            </div>

            <div className={styles.middleGroup}>
              <div className={styles.offhandWrapper}>
                <ItemSlot
                  item={slots[40]} index={40} onSlotClick={handleSlotClick}
                  onHover={handleHover} onLeave={handleLeave}
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
                      onSlotClick={handleSlotClick} onHover={handleHover}
                      onLeave={handleLeave} isGhost={slots[index]?.isGhost}
                    />
                  ))}
                </div>
                <div className={styles.craftingOutputRow}>
                  <div className={styles.arrow} />
                  <ItemSlot
                    item={slots[45]} index={45} onSlotClick={handleSlotClick}
                    onHover={handleHover} onLeave={handleLeave}
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
                <ItemSlot key={index} item={item} index={index} onSlotClick={handleSlotClick} onHover={handleHover} onLeave={handleLeave} />
              ))}
            </div>
            <div className={styles.hotbar9x1}>
              {slots.slice(27, 36).map((item, index) => (
                <ItemSlot key={index + 27} item={item} index={index + 27} onSlotClick={handleSlotClick} onHover={handleHover} onLeave={handleLeave} />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.effectsContainer}>
          {ACTIVE_EFFECTS.map((effect) => (
            <div
              key={effect.id}
              className={styles.effectIconSquare}
              onMouseEnter={() => handleHover({ name: effect.name, description: effect.duration })}
              onMouseLeave={handleLeave}
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
