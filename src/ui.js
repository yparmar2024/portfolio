export const singleIcon = `<svg viewBox="0 0 80 80" aria-hidden="true"><circle class="single-ring" cx="40" cy="40" r="29"/><path class="triangle" d="M40 24 57 53H23Z"/></svg>`;
const repeatIcon = `<svg viewBox="0 0 80 80" aria-hidden="true"><circle class="ring-track" cx="40" cy="40" r="32"/><circle class="ring-fill" cx="40" cy="40" r="32" pathLength="100"/><circle class="inner-ring" cx="40" cy="40" r="19"/><rect class="square" x="31" y="31" width="18" height="18" rx="1"/><path class="triangle" d="M40 24 57 53H23Z"/></svg>`;
export const pageTemplate = `
  <main>
    <canvas id="world" aria-label="Interactive moonlit fire escape and bedroom"></canvas>
    <div class="frame" aria-hidden="true"></div>
    <div id="hotspots" hidden></div>
    <div id="loading" role="status" aria-label="Loading the room"><span class="sr-only">Loading the room…</span></div>
    <nav id="inspect-controls" aria-label="Object inspection" hidden><button id="back-room" aria-label="Return to room">←</button><button id="read-object" aria-label="Read object details"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5"/></svg></button></nav>
    <button id="action" class="game-prompt" aria-describedby="status" disabled>${repeatIcon}</button>
    <span id="status" class="sr-only" role="status"></span>
    <progress class="sr-only" max="3" value="0" aria-label="Interaction momentum"></progress>
    <button id="menu-toggle" aria-label="Open navigation and help" aria-haspopup="dialog"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17"/><path d="M12 15H28M12 20H28M12 25H28"/></svg></button>
    <dialog id="menu"><button class="dialog-close" aria-label="Close menu">✕</button><h2>Your corner of the city.</h2><div class="menu-actions"><button id="skip" disabled>Enter room</button><button id="replay" disabled>Replay introduction</button><button id="help">How to explore</button></div><nav id="room-nav" aria-label="Room objects" hidden><button data-item="About">About me</button><button data-item="Projects">Projects</button><button data-item="Experience">Experience</button><button data-item="Records">Records</button></nav></dialog>
    <div id="fallback" hidden><h1>A little trouble with the view.</h1><p>This experience needs WebGL 2. Try enabling browser graphics acceleration, or explore the introduction below.</p><button id="fallback-about">Meet Yash</button><button id="retry">Try again</button></div>
    <dialog id="details"><button id="close" class="dialog-close" aria-label="Close details">✕</button><p class="eyebrow" id="detail-label"></p><h2 id="detail-title"></h2><p id="detail-body"></p></dialog>
  </main>`;
