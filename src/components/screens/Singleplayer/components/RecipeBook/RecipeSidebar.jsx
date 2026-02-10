/**
 * Recipe Book Sidebar component
 *
 * Displays a filterable list of crafting recipes with search and craftable filter.
 * Shows visual status (craftable/uncraftable) based on inventory contents.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the sidebar is visible
 * @param {Function} props.onHover - Handler for item hover events
 * @param {Function} props.onLeave - Handler for item hover leave events
 * @param {Array} props.inventory - Current inventory slots array
 * @param {Object|null} props.heldItem - Currently held item (for crafting validation)
 * @param {Function} props.onRecipeClick - Handler when a recipe is clicked
 * @returns {JSX.Element} Recipe sidebar with search and filter controls
 */
import React, { useState, useEffect, useRef } from 'react';
import styles from './RecipeSidebar.module.css';
import MinecraftInput from '../../../../common/MinecraftInput/MinecraftInput';
import useSound from '../../../../../hooks/useSound';
import ItemSlot from '../ItemSlot/ItemSlot';
import recipesData from '../../../../../data/recipes.json';

const RecipeSidebar = ({ isOpen, onHover, onLeave, inventory, heldItem, onRecipeClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showCraftable, setShowCraftable] = useState(false);
  const [isFilterHovered, setIsFilterHovered] = useState(false);

  const inputRef = useRef(null);
  const playClickSound = useSound('/sounds/click.ogg', 'ui');

  useEffect(() => {
    if (isFilterHovered && onHover) {
      onHover(showCraftable ? "Showing Craftable" : "Showing All");
    }
  }, [showCraftable, isFilterHovered, onHover]);

  const handleFilterClick = () => {
    playClickSound();
    setShowCraftable(!showCraftable);
  };

  // --- HELPER: Check if User has Ingredients ---
  const checkCanCraft = (recipe) => {
    if (!inventory) return false;

    return recipe.ingredients.every(ing => {
      // 1. Check Inventory & Grid (0-44)
      // We perform a thorough search:
      const inInventory = inventory.slice(0, 45).some(slot => 
        slot && 
        slot.id === ing.item && 
        !slot.isGhost // CRITICAL: Ignore Ghosts in the grid
      );
      
      // 2. Check Held Item
      const isHeld = heldItem && heldItem.id === ing.item;

      return inInventory || isHeld;
    });
  };

  // --- FILTERING LOGIC ---
  const getVisibleRecipes = () => {
    return recipesData.filter(recipe => {
      // 1. Search Filter
      const matchesSearch = recipe.result.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Craftable Filter
      if (showCraftable) {
        return checkCanCraft(recipe);
      }
      return true;
    });
  };

  const visibleRecipes = getVisibleRecipes();

  const getInputClass = () => {
    if (isFocused) return styles.inputFocused; 
    if (searchQuery.length > 0) return styles.inputFilled; 
    return styles.inputEmpty; 
  };

  const getFilterIcon = () => {
    if (showCraftable) {
      return isFilterHovered 
        ? "/icons/ui/filter_enabled_highlighted.png" 
        : "/icons/ui/filter_enabled.png";
    } else {
      return isFilterHovered 
        ? "/icons/ui/filter_disabled_highlighted.png" 
        : "/icons/ui/filter_disabled.png";
    }
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.innerContainer}>
        
        <div className={styles.header}>
          <img 
            src="/icons/ui/search.png" 
            alt="Search" 
            className={styles.searchIcon}
            onMouseDown={(e) => {
                e.preventDefault();
                if (!isFocused) inputRef.current?.focus();
            }}
          />
          
          <MinecraftInput 
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className={`${styles.searchInputWrapper} ${getInputClass()}`}
            onFocusChange={setIsFocused} 
          />

          <div 
            className={styles.filterContainer}
            onClick={handleFilterClick}
            onMouseEnter={() => setIsFilterHovered(true)}
            onMouseLeave={() => {
              setIsFilterHovered(false);
              if (onLeave) onLeave(); 
            }}
          >
            <img src={getFilterIcon()} alt="Filter" className={styles.filterIcon} />
          </div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.recipeGrid}>
            {visibleRecipes.map((recipe) => {
              // Calculate status for styling
              const canCraft = checkCanCraft(recipe);
              const statusClass = canCraft ? styles.craftableSlot : styles.uncraftableSlot;

              return (
                <div key={recipe.id} className={styles.recipeSlotWrapper}>
                  <ItemSlot 
                    item={recipe.result} 
                    index={-1} 
                    onSlotClick={() => onRecipeClick(recipe)} 
                    onHover={() => onHover && onHover(recipe.result)}
                    onLeave={() => onLeave && onLeave()}
                    isRecipe={true}
                    className={statusClass}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeSidebar;