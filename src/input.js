export function bindCanvas(
  canvas,
  { getState, getWorld, inspect, press, menu, dialog },
) {
  let drag = null,
    dragged = false;
  canvas.onclick = (event) => {
    if (dragged) {
      dragged = false;
      return;
    }
    if (getState() === 'room' && !menu.open && !dialog.open) {
      const item = getWorld()?.hitItem(event.clientX, event.clientY);
      if (item) inspect(item);
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
    if (getState() === 'room' && event.button === 0) {
      drag = {
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
      };
      dragged = false;
      canvas.setPointerCapture(event.pointerId);
    }
  };
  canvas.onpointerup = canvas.onpointercancel = () => {
    drag = null;
  };
  canvas.onpointermove = (event) => {
    if (drag) {
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
