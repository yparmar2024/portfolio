import { openSurfaceLink } from './surface-links.js';
import { bindCanvas } from './input.js';
import { createDialogs } from './dialogs.js';
import { createNavigation } from './navigation.js';
import { projects, roles, readingPage } from './portfolio-pages.js';
import { contactLine, copy } from './content.js';
import './style.css';
import { createProgress } from './progress.js';
import { createWorld } from './world.js';

const app = document.querySelector('#app');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
import { singleIcon, pageTemplate } from './ui.js';
app.innerHTML = pageTemplate;
const $ = (selector) => document.querySelector(selector);
const canvas = $('#world'),
  actionButton = $('#action'),
  bar = $('progress'),
  status = $('#status');
const dialog = $('#details');
const menu = createNavigation($);
let world,
  action,
  timer,
  state = 'loading',
  projectionFrame,
  inspected = null;
let roomReady = false;
app.dataset.state = 'loading';

const { showDetails } = createDialogs($, copy, menu);
let pageIndex = 0;
function showPage(index) {
  pageIndex = index;
  const length = projects.length;
  const [, title, body, note] = readingPage('Projects', index);
  world.setPage('Projects', index);
  $('#scene-title').textContent = title;
  $('#scene-body').textContent = body + ' · ' + note;
  $('#page-count').textContent = index + 1 + ' / ' + length;
  $('#prev-page').disabled = index === 0;
  $('#next-page').disabled = index === length - 1;
  $('#project-link').href =
    'https://github.com/yparmar2024/' + projects[index].repo;
  status.textContent = [title, body, note].join('. ');
}
$('#prev-page').onclick = () => showPage(pageIndex - 1);
$('#next-page').onclick = () => showPage(pageIndex + 1);
function inspect(name) {
  if (state !== 'room') return;
  menu.close();
  inspected = name;
  app.dataset.focus = name;
  world.focus(name);
  menu.select(name);
  $('#inspect-controls').hidden = false;
  $('#surface-links').hidden = name === 'Experience';
  $('#linkedin-link').hidden = name !== 'About';
  $('#github-link').hidden = name !== 'About';
  $('#project-link').hidden = name !== 'Projects';
  $('#scene-title').textContent = copy[name][1];
  $('#scene-body').textContent = copy[name][2];
  $('#page-tools').hidden = name !== 'Projects';
  if (name === 'About') $('#scene-body').textContent += ' ' + contactLine;
  if (name === 'Experience') {
    $('#scene-title').textContent = 'Experience board';
    $('#scene-body').textContent = roles
      .map(
        ([start, end, company, role]) =>
          `${role}, ${company}, ${start} to ${end}.`,
      )
      .join(' ');
  }
  if (!$('#page-tools').hidden) showPage(0);
  $('#scene-reading').hidden = false;
  status.textContent = `Inspecting ${name}. Read the object in the room. Circle or Escape returns to the room.`;
  $('#scene-reading').focus({ preventScroll: true });
}
function returnToRoom() {
  inspected = null;
  app.dataset.focus = '';
  $('#inspect-controls').hidden = true;
  $('#surface-links').hidden = true;
  $('#scene-reading').hidden = true;
  menu.select(null);
  world?.clearFocus();
  $('#menu-toggle').focus({ preventScroll: true });
}
$('#back-room').onclick = returnToRoom;
addEventListener('keydown', (event) => {
  if (
    !event.defaultPrevented &&
    event.key === 'Escape' &&
    inspected &&
    !menu.open &&
    !dialog.open
  ) {
    event.preventDefault();
    returnToRoom();
  }
});
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
  $('#skip').hidden = true;
  $('#intro-menu').hidden = true;
  actionButton.hidden = true;
  $('#room-nav').hidden = false;
  $('#hotspots').hidden = false;
  status.textContent =
    'Inside the room. Choose an object or open the navigation menu.';
  $('#menu-toggle').focus({ preventScroll: true });
}
function startEntry() {
  if (!roomReady) {
    setState('room-wait');
    $('#loading').hidden = false;
    status.textContent = 'The window is open. Loading the room…';
    return;
  }
  setState('entering');
  timer = setTimeout(enterRoom, reducedMotion.matches ? 100 : 2850);
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
          },
          reducedMotion.matches ? 100 : 1300,
        );
      } else {
        startEntry();
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
  actionButton.hidden = true;
  actionButton.disabled = true;
  app.dataset.paperReady = 'false';
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
  $('#surface-links').hidden = true;
  $('#scene-reading').hidden = true;
  menu.select(null);
  menu.close();
  clearTimeout(timer);
  action?.stop();
  $('#loading').hidden = true;
  $('#skip').hidden = false;
  $('#intro-menu').hidden = false;
  $('#room-nav').hidden = true;
  $('#hotspots').hidden = true;
  prepare('paper');
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
  menu.close();
  $('#loading').hidden = true;
  $('#inspect-controls').hidden = true;
  $('#surface-links').hidden = true;
  $('#scene-reading').hidden = true;
  $('#menu-toggle').hidden = true;
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
  $('#replay').disabled = false;
  restart();
  for (const name of ['About', 'Projects', 'Experience']) {
    const button = document.createElement('button');
    button.className = 'hotspot game-prompt';
    button.dataset.name = name;
    button.hidden = true;
    button.innerHTML = singleIcon;
    button.setAttribute('aria-label', name);
    button.onclick = (event) => {
      // A room prompt can overlap a small printed icon at a distance.
      if (
        event.detail &&
        openSurfaceLink(world.hitItem(event.clientX, event.clientY))
      )
        return;
      inspect(name);
    };
    $('#hotspots').append(button);
  }
  function project() {
    projectionFrame = requestAnimationFrame(project);
    if (document.hidden) return;
    const activePrompt = state === 'paper' || state === 'window';
    const ready =
      state === 'window' || (state === 'paper' && world.isPaperReady());
    if (ready || !actionButton.hidden) {
      const point = world.projectAction();
      actionButton.style.left = `${Math.max(10, Math.min(90, point.x))}%`;
      actionButton.style.top = `${Math.max(12, Math.min(88, point.y))}%`;
    }
    if (activePrompt) {
      const wasHidden = actionButton.hidden;
      actionButton.hidden = !ready;
      actionButton.disabled = !ready;
      app.dataset.paperReady = String(ready);
      if (
        ready &&
        wasHidden &&
        !menu.open &&
        !dialog.open &&
        (document.activeElement === document.body ||
          document.activeElement === $('#replay'))
      )
        actionButton.focus({ preventScroll: true });
    }
    if (state !== 'room') return;
    for (const target of world.projectTargets()) {
      const button = $(`[data-name="${target.name}"]`);
      button.style.left = `${target.x}%`;
      button.style.top = `${target.y}%`;
      button.hidden = !target.visible;
    }
  }
  projectionFrame = requestAnimationFrame(project);
  await world.ready;
  if (state === 'error')
    throw new Error('Graphics context was lost while loading');
  roomReady = true;
  app.dataset.roomReady = 'true';
  $('#loading').hidden = true;
  $('#skip').disabled = false;
  if (state === 'room-wait') startEntry();
} catch (error) {
  console.error('Unable to create 3D scene', error);
  world?.dispose();
  fail();
}
