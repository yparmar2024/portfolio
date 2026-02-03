/**
 * Server/Realm list item component
 * 
 * Replicates Minecraft's server list UI with:
 * - Server icon (64x64 pixelated)
 * - Server name and MOTD (message of the day)
 * - Connection quality bars (color-coded by ping)
 * - Ping display in milliseconds
 * - Selection highlighting
 * 
 * Used in both Multiplayer (work experience) and Realms (social links) screens.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.name - Server/realm name
 * @param {string} props.motd - Server description/status message
 * @param {number} props.ping - Latency in milliseconds (default: 0)
 * @param {string} props.dates - Additional info (dates, status, etc.)
 * @param {string} props.icon - Path to server icon image
 * @param {Function} props.onClick - Selection handler
 * @param {boolean} props.selected - Whether this item is currently selected
 */

import styles from './ServerSlot.module.css';
import { getSignalBarColor } from '../../../utils/serverUtils';

export default function ServerSlot({ 
  name, 
  motd, 
  ping = 0, 
  dates,
  icon = '/icons/default_server.png', 
  onClick,
  selected 
}) {
  return (
    <div 
      className={`${styles.container} ${selected ? styles.selected : ''}`} 
      onClick={onClick}
    >
      <img src={icon} alt="Server Icon" className={styles.icon} />
      
      <div className={styles.details}>
        <div className={styles.name}>{name}</div>
        <div className={styles.motd}>{motd}</div>
      </div>

      <div className={styles.status}>
        <div className={styles.dates}>{dates}</div>
        
        <div className={styles.signalBars}>
           {[0, 1, 2, 3, 4].map((i) => (
             <div 
               key={i} 
               className={styles.bar} 
               style={{ 
                 height: `${(i + 2) * 2}px`, 
                 backgroundColor: getSignalBarColor(ping, i)
               }} 
             />
           ))}
        </div>
        
        <div className={styles.pingText}>{ping}ms</div>
      </div>
    </div>
  );
}