import { icons } from './icons.js';

const controls = [
  ['triangle', 'One tap', 'Select an object. Move closer and read it.'],
  [
    'square',
    'Keep tapping',
    'Peel the tag or open the window. Fill the ring until it turns green; pause and progress drains.',
  ],
  ['circle', 'Back to the room', 'Leave a close-up. Escape works too.'],
  ['look', 'Look around', 'Drag with your mouse or swipe across the room.'],
  ['menu', 'Jump to a section', 'Open the wheel and choose a destination.'],
  ['replay', 'Replay the intro', 'Start again at the fire escape.'],
];

export const helpTemplate = `
  <dl class="control-guide">
    ${controls.map(([icon, title, text]) => `<div class="control-row"><dt><span class="guide-icon guide-${icon}" aria-hidden="true">${icons[icon]}</span><span>${title}</span></dt><dd>${text}</dd></div>`).join('')}
  </dl>
  <div class="guide-notes">
    <p><kbd>Tab</kbd> to focus · <kbd>Enter</kbd> / <kbd>Space</kbd> to select<br>Arrow keys move around the wheel.</p>
  </div>`;
