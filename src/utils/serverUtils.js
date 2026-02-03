/**
 * Generates a randomized ping value for server/realm entries
 * Simulates network latency between 20-370ms
 * 
 * @returns {number} Random ping value in milliseconds
 */
export const generateRandomPing = () => {
  return Math.floor(Math.random() * 350) + 20;
};

/**
 * Calculates the appropriate signal bar color based on ping and bar position
 * Implements Minecraft-style connection quality visualization
 * 
 * @param {number} ping - Current latency in milliseconds
 * @param {number} barIndex - Bar position (0-4, left to right)
 * @returns {string} Hex color code for the bar
 */
export const getSignalBarColor = (ping, barIndex) => {
  if (ping < 0) return '#aa0000';
  if (barIndex === 0) return '#00aa00';
  if (barIndex === 1) return '#00aa00';
  if (barIndex === 2) return ping < 300 ? '#00aa00' : '#aaaa00';
  if (barIndex === 3) return ping < 150 ? '#00aa00' : '#555555';
  if (barIndex === 4) return ping < 50 ? '#00aa00' : '#555555';
  return '#555555';
};

/**
 * Enriches server/realm data with randomized ping values
 * Used for initial state hydration of server lists
 * 
 * @param {Array<Object>} items - Array of server/realm objects
 * @returns {Array<Object>} Items with added ping property
 */
export const enrichWithPing = (items) => {
  return items.map(item => ({
    ...item,
    ping: generateRandomPing()
  }));
};

/**
 * Calculates the current theme based on time of day
 * Used for Auto theme setting
 * 
 * @returns {'Day'|'Night'} Current theme based on hour
 */
export const getThemeFromTime = () => {
  const hour = new Date().getHours();
  return (hour > 6 && hour < 18) ? 'Day' : 'Night';
};
