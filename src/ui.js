import { icons } from './icons.js';
import { helpTemplate } from './help.js';
export const singleIcon = `<svg viewBox="0 0 80 80" aria-hidden="true"><circle class="single-ring" cx="40" cy="40" r="29"/><path class="triangle" d="M40 24 57 53H23Z"/></svg>`;
const repeatIcon = `<svg viewBox="0 0 80 80" aria-hidden="true"><circle class="ring-track" cx="40" cy="40" r="32"/><circle class="ring-fill" cx="40" cy="40" r="32" pathLength="100"/><circle class="inner-ring" cx="40" cy="40" r="19"/><rect class="square" x="31" y="31" width="18" height="18" rx="1"/><path class="triangle" d="M40 24 57 53H23Z"/></svg>`;
const destinations = ['About', 'Projects', 'Experience'];
const dockButton = (id, label, icon, attributes = '') =>
  `<button id="${id}" class="dock-button" aria-label="${label}" ${attributes}>${icons[icon]}<span class="control-tip" aria-hidden="true">${label}</span></button>`;
export const pageTemplate = `
  <main>
    <canvas id="world" aria-label="Interactive moonlit fire escape and bedroom"></canvas>
    <div class="frame" aria-hidden="true"></div>
    <div id="hotspots" hidden></div>
    <div id="loading" hidden role="status" aria-label="Loading the room"><span class="sr-only">Loading the room…</span></div>
    <nav id="inspect-controls" aria-label="Object inspection" hidden>
      <button id="back-room" class="game-prompt" aria-label="Return to room" aria-keyshortcuts="Escape"><svg viewBox="0 0 80 80" aria-hidden="true"><circle class="single-ring" cx="40" cy="40" r="29"/><circle class="back-ring" cx="40" cy="40" r="14"/></svg></button>
      <div id="page-tools" hidden><button id="prev-page" aria-label="Previous entry">↑</button><span id="page-count"></span><button id="next-page" aria-label="Next entry">↓</button></div>
    </nav>
    <article id="scene-reading" class="sr-only" aria-labelledby="scene-title" tabindex="-1" hidden>
      <h1 id="scene-title"></h1><p id="scene-body"></p>
    </article>
    <nav id="surface-links" aria-label="Links on the inspected object" hidden>
      <a id="linkedin-link" class="surface-link" href="https://www.linkedin.com/in/yparmar" aria-label="LinkedIn" hidden><img src="/contact-icons/linkedin.svg" alt=""></a>
      <a id="github-link" class="surface-link" href="https://www.github.com/yparmar2024" aria-label="GitHub" hidden><img src="/contact-icons/github.svg" alt=""></a>
      <a id="project-link" class="surface-link" hidden target="_blank" rel="noopener noreferrer" aria-label="Project on GitHub"><img src="/contact-icons/github.svg" alt=""></a>
    </nav>
    <button id="action" class="game-prompt" aria-describedby="status" hidden disabled>${repeatIcon}</button>
    <span id="status" class="sr-only" role="status"></span>
    <progress class="sr-only" max="3" value="0" aria-label="Interaction momentum"></progress>
    <div id="menu-scrim" hidden></div>
    <dialog id="menu" aria-label="Explore the room">
      <div id="intro-menu"><h2>Enter the room to learn more about me.</h2><button id="skip" disabled>Enter room</button></div>
      <nav id="room-nav" aria-label="Room objects" hidden>
        <div class="radial-web" aria-hidden="true"></div>
        ${destinations.map((name, index) => `<button class="radial-item" data-item="${name}" style="--item:${index}">${icons[name]}<span>${name === 'About' ? 'About me' : name}</span><small aria-hidden="true">0${index + 1}</small></button>`).join('')}
        <button id="menu-close" aria-label="Close navigation">${icons.close}</button>
      </nav>
    </dialog>
    <nav id="utility-dock" aria-label="Experience controls">
      ${dockButton('replay', 'Replay introduction', 'replay', 'disabled')}
      ${dockButton('help', 'How to explore', 'help')}
      ${dockButton('menu-toggle', 'Open navigation', 'menu', 'aria-haspopup="dialog" aria-controls="menu" aria-expanded="false"')}
    </nav>
    <div id="fallback" hidden><h1>A little trouble with the view.</h1><p>This experience needs WebGL 2. Try enabling browser graphics acceleration, or explore the introduction below.</p><button id="fallback-about">Meet Yash</button><button id="retry">Try again</button></div>
    <dialog id="details" aria-labelledby="detail-title"><button id="close" class="dialog-close" aria-label="Close details">${icons.close}</button><p class="eyebrow" id="detail-label"></p><h2 id="detail-title"></h2><p id="detail-body"></p><div id="control-guide" hidden>${helpTemplate}</div></dialog>
  </main>`;
