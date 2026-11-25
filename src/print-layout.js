// Preserve intentional entries and measure before painting so a longer bio
// cannot quietly run into the footer on the physical object.
export function wrapPrintText(ctx, text, width) {
  const lines = [];
  for (const entry of text.split('\n')) {
    let line = '';
    for (const word of entry.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  return lines;
}

export function paintParagraph(
  ctx,
  text,
  x,
  y,
  width,
  size,
  lineHeight,
  bold = false,
) {
  ctx.font = `${bold ? 'italic 900' : '500'} ${size}px Arial, sans-serif`;
  const lines = wrapPrintText(ctx, text, width);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

export function fitBodySize(ctx, text, width, height, preferred) {
  for (let size = preferred; size >= 24; size -= 1) {
    ctx.font = `500 ${size}px Arial, sans-serif`;
    if (wrapPrintText(ctx, text, width).length * size * 1.36 <= height)
      return size;
  }
  throw new Error(
    'Room copy exceeds its reading surface. Shorten the section.',
  );
}
