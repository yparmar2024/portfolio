/**
 * Common style constants and utility functions
 * Centralized styling patterns used across multiple screens
 */

/**
 * Profile box styling for the Options screen
 * Used to display user information with consistent Minecraft theming
 */
export const PROFILE_BOX_STYLES = {
  container: {
    flex: 1,
    padding: '20px',
    border: '2px solid #555',
    backgroundColor: 'rgba(0,0,0,0.4)',
    color: '#fff',
    fontSize: '18px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '10px'
  },
  label: {
    color: '#ffff55'
  }
};

/**
 * Info box styling for detail views
 * Used for job descriptions and other content blocks
 */
export const INFO_BOX_STYLES = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  width: '100%',
  fontSize: '16px',
  color: '#ffffff',
  lineHeight: '1.4',
  textAlign: 'left',
  backgroundColor: 'rgba(0,0,0,0.3)',
  padding: '20px',
  border: '2px solid #1a1a1a'
};

/**
 * Modal button layout configuration
 * Standard two-row button layout used in Multiplayer and Realms
 */
export const MODAL_CONTROLS_STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    alignItems: 'center'
  },
  buttonRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    width: '100%'
  },
  button: {
    flex: 1
  }
};

/**
 * Drag-and-drop zone styling for the jukebox
 * Visual feedback states for drag interactions
 */
export const DRAG_DROP_STYLES = {
  idle: {
    border: '3px solid #555',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  dragging: {
    border: '4px dashed #ffff55',
    backgroundColor: 'rgba(255,255,85,0.2)'
  },
  transition: 'all 0.2s'
};

/**
 * Creates a flexbox row container with consistent gap
 * @param {number} gap - Gap between items in pixels (default: 10)
 * @returns {Object} Style object for flex row
 */
export const createFlexRow = (gap = 10) => ({
  display: 'flex',
  gap: `${gap}px`,
  width: '100%'
});

/**
 * Creates a flexbox column container with consistent gap
 * @param {number} gap - Gap between items in pixels (default: 10)
 * @returns {Object} Style object for flex column
 */
export const createFlexColumn = (gap = 10) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: `${gap}px`,
  width: '100%'
});
