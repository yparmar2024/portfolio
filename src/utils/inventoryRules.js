/**
 * Inventory placement rules and slot-range constants.
 *
 * Centralises all logic that determines whether an item can be placed in a
 * given slot, mirroring Minecraft's Java Edition placement restrictions:
 *
 * - Inventory / Hotbar (0–35): accept any item
 * - Armor slots (36–39):       accept only the matching armor type
 * - Offhand (40):              accepts shields only
 * - Crafting input (41–44):    accepts block-type skill items only
 * - Crafting output (45):      never writable by the player
 *
 * @module inventoryRules
 */

/** Canonical slot-index ranges, mirroring the 46-slot layout in Singleplayer. */
export const SLOT_RANGES = {
  INVENTORY:       { start: 0, end: 26 },
  HOTBAR:          { start: 27, end: 35 },
  BOOTS:            36,
  LEGGINGS:         37,
  CHESTPLATE:       38,
  HELMET:           39,
  OFFHAND:          40,
  CRAFTING_INPUT:  { start: 41, end: 44 },
  CRAFTING_OUTPUT:  45
};

/**
 * Determines whether an item is permitted to be placed in a given slot.
 *
 * The output slot (45) is intentionally read-only and is handled separately
 * by the click handler in Singleplayer.jsx — this function will never receive
 * index 45 under normal operation.
 *
 * @param {Object|null} item        - The item being held/dragged
 * @param {number}      targetIndex - Destination slot index (0–44)
 * @returns {boolean} `true` if the placement is permitted
 */
export const canPlaceItemInSlot = (item, targetIndex) => {
  if (!item) return true;

  if (targetIndex <= 35) return true;

  if (targetIndex === SLOT_RANGES.CRAFTING_OUTPUT) return false;

  if (targetIndex === SLOT_RANGES.HELMET)     return item.isArmor && item.armorType === 'helmet';
  if (targetIndex === SLOT_RANGES.CHESTPLATE) return item.isArmor && item.armorType === 'chestplate';
  if (targetIndex === SLOT_RANGES.LEGGINGS)   return item.isArmor && item.armorType === 'leggings';
  if (targetIndex === SLOT_RANGES.BOOTS)      return item.isArmor && item.armorType === 'boots';

  if (targetIndex === SLOT_RANGES.OFFHAND) return item.isShield === true;

  if (
    targetIndex >= SLOT_RANGES.CRAFTING_INPUT.start &&
    targetIndex <= SLOT_RANGES.CRAFTING_INPUT.end
  ) {
    return item.isBlock === true;
  }

  return false;
};
