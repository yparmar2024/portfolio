// Define Slot Ranges constants for clarity
export const SLOT_RANGES = {
  INVENTORY: { start: 0, end: 26 },
  HOTBAR: { start: 27, end: 35 },
  BOOTS: 36,
  LEGGINGS: 37,
  CHESTPLATE: 38,
  HELMET: 39,
  OFFHAND: 40,
  CRAFTING_INPUT: { start: 41, end: 44 },
  CRAFTING_OUTPUT: 45
};

/**
 * Checks if an item is allowed to be dropped into a specific slot index.
 * @param {Object} item - The item object being dragged
 * @param {number} targetIndex - The index where the user is trying to drop
 * @returns {boolean} - True if allowed
 */
export const canPlaceItemInSlot = (item, targetIndex) => {
  if (!item) return true; // Moving nothing/swapping empty is usually fine

  // 1. Universal Slots: Inventory and Hotbar accept EVERYTHING
  if (targetIndex <= 35) return true;

  // 2. Output Slot: NEVER allow dropping items INTO the output
  if (targetIndex === SLOT_RANGES.CRAFTING_OUTPUT) return false;

  // 3. Armor Slots Logic
  if (targetIndex === SLOT_RANGES.HELMET) return item.isArmor && item.armorType === 'helmet';
  if (targetIndex === SLOT_RANGES.CHESTPLATE) return item.isArmor && item.armorType === 'chestplate';
  if (targetIndex === SLOT_RANGES.LEGGINGS) return item.isArmor && item.armorType === 'leggings';
  if (targetIndex === SLOT_RANGES.BOOTS) return item.isArmor && item.armorType === 'boots';

  // 4. Offhand Logic (Shields)
  if (targetIndex === SLOT_RANGES.OFFHAND) {
    return item.isShield === true;
  }

  // 5. Crafting Input Logic (Blocks only?)
  if (targetIndex >= SLOT_RANGES.CRAFTING_INPUT.start && targetIndex <= SLOT_RANGES.CRAFTING_INPUT.end) {
    // Only allow "Blocks" (Languages) in the crafting grid?
    return item.isBlock === true;
  }

  return false;
};