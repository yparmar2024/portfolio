/**
 * Custom hook for managing a server/realm list with selection and ping simulation.
 *
 * Initialises list items with randomised ping values and exposes handlers for
 * selecting an item and refreshing all pings with a realistic delay, matching
 * the UX behaviour of the Minecraft Java Edition server list.
 *
 * @module useServerList
 */

import { useState } from 'react';
import { enrichWithPing, generateRandomPing } from '../utils/serverUtils';
import { TIMINGS } from '../constants/timings';

/**
 * @param {Array<Object>} initialData - Raw server or realm data from JSON
 * @returns {{
 *   items: Array<Object>,
 *   selectedId: string|null,
 *   selectedItem: Object|undefined,
 *   isRefreshing: boolean,
 *   handleRefresh: Function,
 *   handleSelect: Function
 * }}
 */
const useServerList = (initialData) => {
  const [items, setItems] = useState(() => enrichWithPing(initialData));
  const [selectedId, setSelectedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedItem = items.find(item => item.id === selectedId);

  /**
   * Re-randomises ping for every item after a brief delay, simulating a
   * network round-trip. The 800ms delay mirrors TIMINGS.SERVER_REFRESH_DELAY.
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setItems(prev => prev.map(item => ({
        ...item,
        ping: generateRandomPing()
      })));
      setIsRefreshing(false);
    }, TIMINGS.SERVER_REFRESH_DELAY);
  };

  /**
   * @param {string|null} id - ID of the item to select, or null to deselect
   */
  const handleSelect = (id) => {
    setSelectedId(id);
  };

  return {
    items,
    selectedId,
    selectedItem,
    isRefreshing,
    handleRefresh,
    handleSelect
  };
};

export default useServerList;
