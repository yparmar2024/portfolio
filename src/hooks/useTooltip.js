/**
 * Manages tooltip state and mouse position tracking
 *
 * Provides centralized tooltip management with automatic mouse following.
 * Extracted pattern from Singleplayer inventory system to reduce duplication.
 *
 * @returns {Object} Tooltip state and handlers
 * @returns {Object|null} returns.hoveredItem - Currently hovered item data
 * @returns {React.RefObject} returns.tooltipRef - Ref for tooltip DOM element
 * @returns {Function} returns.handleHover - Handler to show tooltip with item data
 * @returns {Function} returns.handleLeave - Handler to hide tooltip
 *
 * @example
 * const { hoveredItem, tooltipRef, handleHover, handleLeave } = useTooltip();
 *
 * <div
 *   onMouseEnter={() => handleHover(item)}
 *   onMouseLeave={handleLeave}
 * >
 *   Item
 * </div>
 *
 * {hoveredItem && (
 *   <div ref={tooltipRef} className={styles.tooltip}>
 *     {hoveredItem.name}
 *   </div>
 * )}
 */
import { useState, useRef, useEffect } from 'react';

const useTooltip = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const tooltipRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (tooltipRef.current) {
        tooltipRef.current.style.left = `${e.clientX + 15}px`;
        tooltipRef.current.style.top = `${e.clientY - 30}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return {
    hoveredItem,
    tooltipRef,
    handleHover: setHoveredItem,
    handleLeave: () => setHoveredItem(null)
  };
};

export default useTooltip;
