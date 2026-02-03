import { useState } from 'react';
import { enrichWithPing, generateRandomPing } from '../utils/serverUtils';

/**
 * Custom hook for managing server/realm list state
 * Handles selection, refresh, and ping simulation
 * 
 * @param {Array<Object>} initialData - Initial server/realm data
 * @returns {Object} Server list state and handlers
 */
const useServerList = (initialData) => {
  const [items, setItems] = useState(() => enrichWithPing(initialData));
  const [selectedId, setSelectedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedItem = items.find(item => item.id === selectedId);

  /**
   * Simulates server ping refresh with realistic delay
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setItems(prev => prev.map(item => ({
        ...item,
        ping: generateRandomPing()
      })));
      setIsRefreshing(false);
    }, 800);
  };

  /**
   * Updates the selected server/realm ID
   * @param {string|null} id - ID of the item to select
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
