import styles from './ServerSlot.module.css';

export default function ServerSlot({ 
  name, 
  motd, 
  ping = 0, 
  players = '0/0', 
  icon = '/icons/icon.png', 
  onClick 
}) {
  
  // Logic to color bars based on ping
  const getBarColor = (barIndex) => {
    if (ping < 0) return '#aa0000'; // Error red
    // 5 bars logic
    if (barIndex === 0) return '#00aa00'; // Always green base
    if (barIndex === 1) return '#00aa00';
    if (barIndex === 2) return ping < 300 ? '#00aa00' : '#aaaa00';
    if (barIndex === 3) return ping < 150 ? '#00aa00' : '#555555'; // Grey if bad ping
    if (barIndex === 4) return ping < 50 ? '#00aa00' : '#555555';
    return '#555555';
  };

  return (
    <div className={styles.container} onClick={onClick}>
      
      {/* 1. Server Icon */}
      <img src={icon} alt="Server Icon" className={styles.icon} />
      
      {/* 2. Server Details (Name & Description) */}
      <div className={styles.details}>
        <div className={styles.name}>{name}</div>
        <div className={styles.motd}>{motd}</div>
      </div>

      {/* 3. Connection Status (Ping & Bars) */}
      <div className={styles.status}>
        <div className={styles.playerCount}>{players}</div>
        
        <div className={styles.signalBars}>
           {[0, 1, 2, 3, 4].map((i) => (
             <div 
               key={i} 
               className={styles.bar} 
               style={{ 
                 height: `${(i + 2) * 2}px`, // Steps: 4px, 6px, 8px, 10px, 12px
                 backgroundColor: getBarColor(i)
               }} 
             />
           ))}
        </div>
        
        <div className={styles.pingText}>{ping}ms</div>
      </div>
    </div>
  );
}