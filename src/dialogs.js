export function createDialogs($, copy, menu) {
  const dialog = $('#details');
  let restoreFocus;
  function showDetails(name) {
    const [label, title, body] = copy[name];
    restoreFocus = menu.open ? $('#menu-toggle') : document.activeElement;
    menu.close();
    $('#detail-label').textContent = label;
    $('#detail-title').textContent = title;
    $('#detail-body').textContent = body;
    $('#detail-body').hidden = name === 'Help';
    $('#control-guide').hidden = name !== 'Help';
    dialog.dataset.kind = name;
    dialog.showModal();
  }
  dialog.addEventListener('close', () => restoreFocus?.focus());
  $('#close').onclick = () => dialog.close();
  for (const modal of [dialog])
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
