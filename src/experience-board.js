import { roles } from './portfolio-pages.js';
import { paintParagraph, wrapPrintText } from './print-layout.js';

export const boardSize = [1800, 1236];
const noteWidth = 515;
const noteHeight = 505;
const positions = [
  [75, 85],
  [643, 85],
  [1210, 85],
  [360, 650],
  [925, 650],
];
const files = [
  'quantum-pulse.jpeg',
  'stevens.png',
  'blueprint.webp',
  'stevens.png',
  'kion.svg',
];
const logos = new Map();

export async function loadBoardLogos() {
  await Promise.all(
    [...new Set(files.filter(Boolean))].map(async (file) => {
      const image = new Image();
      image.src = '/organization-logos/' + file;
      try {
        await image.decode();
        logos.set(file, image);
      } catch {
        // The organization name remains printed if its image cannot load.
      }
    }),
  );
}

export function drawExperienceBoard(ctx) {
  ctx.fillStyle = '#906444';
  ctx.fillRect(0, 0, ...boardSize);
  for (let y = 0; y < boardSize[1]; y += 11) {
    for (let x = 0; x < boardSize[0]; x += 11) {
      ctx.fillStyle = (x + y) % 3 === 0 ? '#c7986d50' : '#59331d40';
      ctx.fillRect(x, y + Math.sin(x * y) * 5, 3 + (x % 5), 3);
    }
  }
  ctx.textBaseline = 'top';
  roles.forEach(([start, end, company, role], index) => {
    const [x, y] = positions[index];
    ctx.fillStyle = '#41241560';
    ctx.fillRect(x + 8, y + 11, noteWidth, noteHeight);
    ctx.fillStyle = ['#f5dd9e', '#f5cdbf', '#d1e3ef', '#f5e6c9', '#d8e6c5'][
      index
    ];
    ctx.fillRect(x, y, noteWidth, noteHeight);
    ctx.fillStyle = '#28303c';
    const logo = logos.get(files[index]);
    if (logo) {
      const scale = Math.min(215 / logo.naturalWidth, 96 / logo.naturalHeight);
      ctx.drawImage(
        logo,
        x + 34,
        y + 54,
        logo.naturalWidth * scale,
        logo.naturalHeight * scale,
      );
    }
    let roleSize = 52;
    ctx.font = 'italic 900 52px Arial, sans-serif';
    while (
      wrapPrintText(ctx, role, noteWidth - 68).length > 2 &&
      roleSize > 34
    ) {
      roleSize -= 2;
      ctx.font = `italic 900 ${roleSize}px Arial, sans-serif`;
    }
    const next = paintParagraph(
      ctx,
      role,
      x + 34,
      y + 165,
      noteWidth - 68,
      roleSize,
      roleSize * 1.1,
      true,
    );
    paintParagraph(ctx, company, x + 34, next + 17, noteWidth - 68, 43, 47);
    ctx.fillStyle = '#712438';
    ctx.font = 'bold 41px Arial, sans-serif';
    ctx.fillText(`${start} – ${end}`, x + 34, y + 437);
  });
  ctx.strokeStyle = '#a4243d';
  ctx.lineWidth = 6;
  ctx.beginPath();
  positions.forEach(([x, y], index) => {
    if (index === 3) {
      ctx.lineTo(boardSize[0] - 35, positions[2][1] + 23);
      ctx.lineTo(boardSize[0] - 35, y - 36);
      ctx.lineTo(x + noteWidth / 2, y - 36);
    }
    ctx.lineTo(x + noteWidth / 2, y + 23);
  });
  ctx.stroke();
  for (const [x, y] of positions) {
    ctx.fillStyle = '#732434';
    ctx.beginPath();
    ctx.arc(x + noteWidth / 2, y + 23, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fda2a9';
    ctx.beginPath();
    ctx.arc(x + noteWidth / 2 - 4, y + 19, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
