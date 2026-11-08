import { bindCanvas } from './input.js';
import { createDialogs } from './dialogs.js';
import { copy } from './content.js';
import './style.css';
import { createProgress } from './progress.js';
import { createWorld } from './world.js';

const app = document.querySelector('#app');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const VISIT_KEY = 'yp-3d-entered';
import { singleIcon, pageTemplate } from './ui.js';
app.innerHTML = pageTemplate;
const $ = (selector) => document.querySelector(selector);
const canvas = $('#world'),
  actionButton = $('#action'),
  bar = $('progress'),
  status = $('#status');
const dialog = $('#details'),
  menu = $('#menu');
let world,
  action,
  timer,
  state = 'loading',
  projectionFrame,
  inspected = null;
app.dataset.state = 'loading';

const { showDetails } = createDialogs($, copy);
function inspect(name) {
  if (state !== 'room') return;
  menu.close();
  inspected = name;
  app.dataset.focus = name;
  world.focus(name);
  $('#inspect-controls').hidden = false;
  status.textContent = `Inspecting ${name}. Read the details or return to the room.`;
  $('#read-object').focus({ preventScroll: true });
}
function returnToRoom() {
  inspected = null;
  app.dataset.focus = '';
  $('#inspect-controls').hidden = true;
  world?.clearFocus();
  $('#menu-toggle').focus({ preventScroll: true });
}
$('#back-room').onclick = returnToRoom;
$('#read-object').onclick = () => {
  if (inspected) showDetails(inspected);
};
addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && inspected && !menu.open && !dialog.open) {
    event.preventDefault();
    returnToRoom();
  }
});
function remember() {
  try {
    localStorage.setItem(VISIT_KEY, '1');
  } catch {
    /* Private storage can be unavailable. */
  }
}
function setState(next) {
  state = next;
  app.dataset.state = next;
  world?.setState(next);
}
function enterRoom() {
  menu.close();
  clearTimeout(timer);
  action?.stop();
  setState('room');
  world?.setProgress(1);
  remember();
  $('#skip').hidden = true;
  actionButton.hidden = true;
  $('#room-nav').hidden = false;
  $('#hotspots').hidden = false;
  status.textContent =
    'Inside the room. Choose an object or open the navigation menu.';
  $('#menu-toggle').focus({ preventScroll: true });
}
function complete(kind) {
  state = `${kind}-complete`;
  app.dataset.state = state;
  actionButton.dataset.complete = 'true';
  actionButton.disabled = true;
  status.textContent = 'Complete.';
  timer = setTimeout(
    () => {
      actionButton.hidden = true;
      if (kind === 'paper') {
        setState('peeling');
        timer = setTimeout(
          () => {
            prepare('window');
            actionButton.focus({ preventScroll: true });
          },
          reducedMotion.matches ? 100 : 1300,
        );
      } else {
        setState('entering');
        timer = setTimeout(enterRoom, reducedMotion.matches ? 100 : 2850);
      }
    },
    reducedMotion.matches ? 100 : 240,
  );
}
function prepare(kind) {
  setState(kind);
  const target = kind === 'paper' ? 3 : 5;
  bar.max = target;
  bar.value = 0;
  world?.setProgress(0);
  actionButton.hidden = kind === 'paper' && !reducedMotion.matches;
  actionButton.disabled = actionButton.hidden;
  app.dataset.paperReady = String(kind !== 'paper' || reducedMotion.matches);
  actionButton.dataset.complete = 'false';
  actionButton.dataset.single = String(reducedMotion.matches);
  actionButton.style.setProperty('--progress', 0);
  actionButton.setAttribute(
    'aria-label',
    kind === 'paper' ? 'Peel away the name tag' : 'Open the window',
  );
  status.textContent = reducedMotion.matches
    ? 'Activate once to continue.'
    : 'Tap the object repeatedly, or use Space or Enter on its prompt. Keep the momentum.';
  action = createProgress(
    target,
    (value) => {
      bar.value = value;
      actionButton.style.setProperty('--progress', value / target);
      world?.setProgress(value / target);
    },
    () => complete(kind),
  );
}
function restart() {
  if (!world) return;
  inspected = null;
  app.dataset.focus = '';
  $('#inspect-controls').hidden = true;
  menu.close();
  clearTimeout(timer);
  action?.stop();
  $('#skip').hidden = false;
  $('#room-nav').hidden = true;
  $('#hotspots').hidden = true;
  prepare('paper');
  actionButton.focus({ preventScroll: true });
}
function press() {
  if (
    (state === 'window' || (state === 'paper' && world?.isPaperReady())) &&
    !dialog.open &&
    !menu.open
  )
    action.press(reducedMotion.matches);
}
actionButton.onclick = press;
actionButton.onkeydown = (event) => {
  if (event.repeat && (event.key === ' ' || event.key === 'Enter'))
    event.preventDefault();
};
bindCanvas(canvas, {
  getState: () => state,
  getWorld: () => world,
  inspect,
  press,
  menu,
  dialog,
});
$('#skip').onclick = enterRoom;
$('#replay').onclick = restart;
$('#help').onclick = () => showDetails('Help');
$('#fallback-about').onclick = () => showDetails('About');
$('#retry').onclick = () => location.reload();
$('#room-nav').onclick = (event) => {
  const item = event.target.closest('[data-item]');
  if (item) inspect(item.dataset.item);
};
function fail() {
  $('#loading').hidden = true;
  $('#inspect-controls').hidden = true;
  $('#fallback p').textContent =
    'The 3D view could not be loaded. Check your connection and browser graphics settings, then retry, or read the introduction below.';
  action?.stop();
  clearTimeout(timer);
  cancelAnimationFrame(projectionFrame);
  setState('error');
  $('#fallback').hidden = false;
  actionButton.hidden = true;
  $('#room-nav').hidden = true;
  $('#hotspots').hidden = true;
  $('#skip').hidden = true;
  $('#replay').hidden = true;
}
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  fail();
});
try {
  world = createWorld(canvas, reducedMotion);
  await world.ready;
  if (state === 'error')
    throw new Error('Graphics context was lost while loading');
  app.dataset.roomReady = 'true';
  $('#loading').hidden = true;
  $('#skip').disabled = false;
  $('#replay').disabled = false;
  for (const name of ['About', 'Projects', 'Experience', 'Records']) {
    const button = document.createElement('button');
    button.className = 'hotspot game-prompt';
    button.dataset.name = name;
    button.hidden = true;
    button.innerHTML = singleIcon;
    button.setAttribute('aria-label', name);
    button.onclick = () => inspect(name);
    $('#hotspots').append(button);
  }
  function project() {
    projectionFrame = requestAnimationFrame(project);
    if (document.hidden) return;
    if (state === 'paper') {
      const ready = world.isPaperReady();
      const wasHidden = actionButton.hidden;
      actionButton.hidden = !ready;
      actionButton.disabled = !ready;
      if (
        ready &&
        wasHidden &&
        !menu.open &&
        !dialog.open &&
        document.activeElement === document.body
      )
        actionButton.focus({ preventScroll: true });
      app.dataset.paperReady = String(ready);
    }
    if (!actionButton.hidden) {
      const point = world.projectAction();
      actionButton.style.left = `${Math.max(10, Math.min(90, point.x))}%`;
      actionButton.style.top = `${Math.max(12, Math.min(88, point.y))}%`;
    }
    if (state !== 'room') return;
    for (const target of world.projectTargets()) {
      const button = $(`[data-name="${target.name}"]`);
      button.style.left = `${target.x}%`;
      button.style.top = `${target.y}%`;
      button.hidden = !target.visible;
    }
  }
  project();
  let visited = false;
  try {
    visited = localStorage.getItem(VISIT_KEY) === '1';
  } catch {
    /* Start outside. */
  }
  visited ? enterRoom() : restart();
} catch (error) {
  console.error('Unable to create 3D scene', error);
  world?.dispose();
  fail();
}
