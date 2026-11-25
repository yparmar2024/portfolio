import { paintSurfaceLinks } from './surface-links.js';
import { boardSize, drawExperienceBoard } from './experience-board.js';
import { readingPage } from './portfolio-pages.js';
import { contactLine, copy, sectionNotes } from './content.js';
import { paintParagraph as paragraph, fitBodySize } from './print-layout.js';

export const printSizes = {
  About: [1536, 824],
  Projects: [1280, 1008],
  Experience: boardSize,
  Records: [1024, 1064],
};

// Typography is painted onto UV-mapped objects, with the same copy in the
// screen-reader transcript. These canvases are generated once, not each frame.
export function drawScenePrint(name, compact = false, index = 0) {
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = printSizes[name];
  const ctx = canvas.getContext('2d');
  const [w, h] = printSizes[name];
  const narrow = name === 'About' && compact;
  const left = narrow ? 440 : 90;
  const width = narrow ? w - 880 : w - 180;
  if (name === 'Experience') {
    drawExperienceBoard(ctx);
    return { canvas, rect: [0, 0, 1, 1] };
  }
  const paged = name === 'Projects';
  const [label, title, body, pageNote] = paged
    ? readingPage(name, index)
    : copy[name];
  ctx.fillStyle =
    name === 'About' ? '#edeedd' : name === 'Records' ? '#f5ca59' : '#f2e5c9';
  ctx.fillRect(0, 0, w, h);
  // A restrained paper grain and irregular ruled lines survive close inspection.
  ctx.fillStyle = '#182a4210';
  for (let y = 9; y < h; y += 9)
    for (let x = 8; x < w; x += 9)
      ctx.fillRect(x + Math.sin(x + y) * 2, y, 1, 1);
  if (name === 'Projects') {
    ctx.strokeStyle = '#82a6b144';
    ctx.lineWidth = 2;
    for (let y = 250; y < h; y += 66) {
      ctx.beginPath();
      ctx.moveTo(55, y);
      ctx.lineTo(w - 40, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#cf5f6555';
    ctx.fillRect(59, 35, 3, h - 70);
  }
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#b12d49';
  ctx.font = `700 ${narrow ? 27 : 28}px monospace`;
  ctx.fillText(label, left, 66);
  ctx.fillStyle = '#172939';
  const titleSize = narrow ? 76 : 96;
  let y = paragraph(
    ctx,
    title,
    left - 3,
    131,
    width,
    titleSize,
    titleSize * 1.04,
    true,
  );
  ctx.strokeStyle = '#b12d49';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(left, y + 13);
  ctx.lineTo(left + Math.min(width * 0.55, 410), y + 8);
  ctx.stroke();
  y += 56;
  const preferred = narrow ? 45 : compact ? 72 : name === 'About' ? 52 : 49;
  const footerSpace = name === 'About' ? 190 : 135;
  const bodySize = fitBodySize(
    ctx,
    body,
    width,
    h - footerSpace - y,
    preferred,
  );
  y = paragraph(ctx, body, left, y, width, bodySize, bodySize * 1.36);
  ctx.fillStyle = '#28627a';
  ctx.font = 'italic 700 27px Arial, sans-serif';
  const note = pageNote || sectionNotes[name];
  const footerSize = Math.min(27, (27 * width) / ctx.measureText(note).width);
  ctx.font = `italic 700 ${footerSize}px Arial, sans-serif`;
  ctx.fillText(
    note,
    left,
    name === 'About'
      ? h - 125
      : name === 'Records'
        ? y + 32
        : Math.max(y + 32, h - 91),
  );
  if (name === 'Records') {
    // An original sleeve graphic, partly tucked behind the actual turntable.
    const x = w * 0.73,
      cy = h * 0.94,
      radius = w * 0.2;
    ctx.fillStyle = '#1c2939';
    ctx.beginPath();
    ctx.arc(x, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f5ca5955';
    ctx.lineWidth = 2;
    for (const scale of [0.65, 0.78, 0.91]) {
      ctx.beginPath();
      ctx.arc(x, cy, radius * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#b12d49';
    ctx.beginPath();
    ctx.arc(x, cy, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  if (name === 'About') {
    paragraph(ctx, contactLine, left, h - 175, width, 30, 33);
  }
  const links = paintSurfaceLinks(ctx, name, w, h, compact, index);
  return { canvas, links, rect: narrow ? [0.265, 0, 0.735, 1] : [0, 0, 1, 1] };
}
