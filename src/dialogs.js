export function createDialogs($, copy) {
  const dialog = $('#details'),
    menu = $('#menu');
  let restoreFocus;
  function showDetails(name) {
    const [label, title, body] = copy[name];
    restoreFocus = menu.open ? $('#menu-toggle') : document.activeElement;
    menu.close();
    $('#detail-label').textContent = label;
    $('#detail-title').textContent = title;
    $('#detail-body').textContent = body;
    dialog.showModal();
  }
  dialog.addEventListener('close', () => restoreFocus?.focus());
  $('#close').onclick = () => dialog.close();
  menu.querySelector('.dialog-close').onclick = () => menu.close();
  $('#menu-toggle').onclick = () => menu.showModal();
  for (const modal of [dialog, menu])
    modal.addEventListener('click', (event) => {
      if (event.target !== modal) return;
      const rect = modal.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        modal.close();
    });
  return { showDetails };
}
