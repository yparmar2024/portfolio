import { openSurfaceLink } from './surface-links.js';

export function bindCanvas(
  canvas,
  { getState, getWorld, inspect, press, menu, dialog },
) {
  let drag = null,
    dragged = false;
  const stage = canvas.closest('main');
  function suppressPinch(event) {
    if (event.touches && event.touches.length < 2) return;
    drag = null;
    dragged = true;
    if (event.cancelable) event.preventDefault();
  }
  // Safari can deliver native gesture events in addition to pointer events.
  for (const type of [
    'touchstart',
    'touchmove',
    'gesturestart',
    'gesturechange',
  ]) {
    stage.addEventListener(type, suppressPinch, { passive: false });
  }
  canvas.onclick = (event) => {
    if (dragged) {
      dragged = false;
      return;
    }
    if (getState() === 'room' && !menu.open && !dialog.open) {
      const item = getWorld()?.hitItem(event.clientX, event.clientY);
      if (!openSurfaceLink(item) && typeof item === 'string') inspect(item);
      return;
    }
    if (
      (getState() === 'paper' &&
        getWorld()?.hitPaper(event.clientX, event.clientY)) ||
      (getState() === 'window' &&
        getWorld()?.hitWindow(event.clientX, event.clientY))
    )
      press();
  };
  canvas.onpointerdown = (event) => {
    if (!event.isPrimary) {
      drag = null;
      dragged = true;
      return;
    }
    dragged = false;
    if (getState() === 'room' && event.button === 0) {
      drag = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
      };
      canvas.setPointerCapture(event.pointerId);
    }
  };
  canvas.onpointerup = canvas.onpointercancel = (event) => {
    if (drag?.pointerId === event.pointerId) drag = null;
  };
  canvas.onpointermove = (event) => {
    if (drag?.pointerId === event.pointerId) {
      if (
        Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5
      )
        dragged = true;
      if (dragged)
        getWorld()?.look(event.clientX - drag.x, event.clientY - drag.y);
      drag.x = event.clientX;
      drag.y = event.clientY;
    }
    if (event.pointerType !== 'mouse') return;
    const hit =
      getState() === 'paper'
        ? getWorld()?.hitPaper(event.clientX, event.clientY)
        : getState() === 'window'
          ? getWorld()?.hitWindow(event.clientX, event.clientY)
          : getState() === 'room' &&
            getWorld()?.hitItem(event.clientX, event.clientY);
    canvas.style.cursor = hit ? 'pointer' : 'default';
  };
}
