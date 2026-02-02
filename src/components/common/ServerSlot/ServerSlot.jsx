import styles from './ServerSlot.module.css';

export default function ServerSlot({ 
  name, 
  motd, 
  ping = 0, 
  dates,
  icon = '/icons/default_server.png', 
  onClick,
  selected 
}) {
  
  const getBarColor = (barIndex) => {
    if (ping < 0) return '#aa0000'; 
    if (barIndex === 0) return '#00aa00'; 
    if (barIndex === 1) return '#00aa00';
    if (barIndex === 2) return ping < 300 ? '#00aa00' : '#aaaa00';
    if (barIndex === 3) return ping < 150 ? '#00aa00' : '#555555'; 
    if (barIndex === 4) return ping < 50 ? '#00aa00' : '#555555';
    return '#555555';
  };

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