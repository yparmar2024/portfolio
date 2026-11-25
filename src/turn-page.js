// Reveal the new print beneath a curling edge on the notebook itself.
export function turnPage(old, texture, forward) {
  const next = texture.image;
  const { width, height } = next;
  const sheet = document.createElement('canvas');
  sheet.width = width;
  sheet.height = height;
  const ctx = sheet.getContext('2d');
  texture.image = sheet;
  let cancelled = false;
  texture.addEventListener('dispose', () => {
    cancelled = true;
  });
  const start = performance.now();
  function paint(now) {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / 320);
    ctx.drawImage(next, 0, 0);
    const edge = height * (forward ? 1 - t : t);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, forward ? 0 : edge, width, forward ? edge : height - edge);
    ctx.clip();
    ctx.drawImage(old, 0, 0);
    const curl = Math.sin(t * Math.PI) * height * 0.12;
    if (curl > 1) {
      const end = edge + (forward ? -curl : curl);
      const fold = ctx.createLinearGradient(0, edge, 0, end);
      fold.addColorStop(0, '#716658');
      fold.addColorStop(0.5, '#fff3da');
      fold.addColorStop(1, 'transparent');
      ctx.fillStyle = fold;
      ctx.fillRect(0, Math.min(end, edge), width, curl);
    }
    ctx.restore();
    texture.needsUpdate = true;
    if (t < 1) requestAnimationFrame(paint);
    else texture.image = next;
  }
  paint(start);
}
