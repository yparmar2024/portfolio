// A non-modal dialog keeps the three dock buttons available while the wheel is open.
export function createNavigation($) {
  const panel = $('#menu');
  const toggle = $('#menu-toggle');
  const scrim = $('#menu-scrim');
  const background = [
    '#world',
    '#hotspots',
    '#surface-links',
    '#action',
    '#inspect-controls',
    '#scene-reading',
  ];
  function close(restoreFocus = false) {
    panel.close();
    scrim.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.querySelector('.control-tip').textContent = 'Open navigation';
    background.forEach((selector) => {
      $(selector).inert = false;
    });
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }
  function open() {
    panel.show();
    scrim.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    toggle.querySelector('.control-tip').textContent = 'Close navigation';
    background.forEach((selector) => {
      $(selector).inert = true;
    });
    const selected = panel.querySelector('[aria-current="true"]');
    (
      selected ||
      ($('#room-nav').hidden ? $('#skip') : $('[data-item="About"]'))
    ).focus();
  }
  toggle.onclick = () => (panel.open ? close(true) : open());
  $('#menu-close').onclick = () => close(true);
  scrim.onclick = () => close(true);
  addEventListener('keydown', (event) => {
    if (!panel.open || $('#details').open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    }
    const items = [...panel.querySelectorAll('[data-item]')];
    const index = items.indexOf(document.activeElement);
    if (index < 0) return;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      event.key
    ];
    if (step || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      items[
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? items.length - 1
            : (index + step + items.length) % items.length
      ].focus();
    }
  });
  return {
    get open() {
      return panel.open;
    },
    close,
    select(name) {
      panel.querySelectorAll('[data-item]').forEach((button) => {
        if (button.dataset.item === name)
          button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
    },
  };
}
