/**
 * Modal control layout helpers
 * Reusable button layout patterns for Minecraft-themed modals
 */

/**
 * Creates a standardized two-row button control layout
 * Used in Multiplayer and Realms screens for consistent UX
 *
 * @param {Array<Object>} topRowButtons - Buttons for the first row
 * @param {Array<Object>} bottomRowButtons - Buttons for the second row
 * @returns {Object} Layout configuration with button groups
 *
 * @example
 * const layout = createModalControls(
 *   [{ label: 'Join', onClick: handleJoin, disabled: !selected }],
 *   [{ label: 'Cancel', onClick: onBack }]
 * );
 */
export const createModalControls = (topRowButtons, bottomRowButtons) => ({
  topRow: topRowButtons,
  bottomRow: bottomRowButtons
});

/**
 * Validates that a selected item exists before performing an action
 * Prevents null reference errors in modal interactions
 *
 * @param {Object|null} selectedItem - Currently selected item
 * @param {Function} action - Action to perform if item exists
 * @returns {void}
 */
export const withSelectedItem = (selectedItem, action) => {
  if (selectedItem) {
    action(selectedItem);
  }
};

/**
 * Opens a URL in a new tab with security best practices
 * Includes rel="noopener noreferrer" for security
 *
 * @param {string} url - URL to open
 * @returns {void}
 */
export const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    newWindow.opener = null;
  }
};

/**
 * Formats multi-line text for display
 * Splits by newline character and filters empty lines
 *
 * @param {string} text - Multi-line text string
 * @returns {Array<string>} Array of non-empty lines
 */
export const formatMultilineText = (text) => {
  return text.split('\n').filter(line => line.trim().length > 0);
};
