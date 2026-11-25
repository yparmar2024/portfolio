import { projects } from './portfolio-pages.js';

const images = new Map();

export async function loadSurfaceIcons() {
  await Promise.all(
    ['linkedin', 'github'].map(async (brand) => {
      const image = new Image();
      image.src = '/contact-icons/' + brand + '.svg';
      try {
        await image.decode();
        images.set(brand, image);
      } catch {
        // Keep a compact text mark if the icon fails to load.
      }
    }),
  );
}

export function paintSurfaceLinks(ctx, name, width, height, compact, page) {
  const compactSizes = { About: 86, Projects: 150 };
  const size = compact ? (compactSizes[name] ?? 76) : 76;
  const right = name === 'About' && compact ? width * 0.735 : width;
  const specs =
    {
      About: [
        ['linkedin', 'https://www.linkedin.com/in/yparmar'],
        ['github', 'https://www.github.com/yparmar2024'],
      ],
      Projects: [
        ['github', 'https://github.com/yparmar2024/' + projects[page].repo],
      ],
    }[name] ?? [];
  return specs.map(([brand, href], index) => {
    const x = right - 26 - size - (specs.length - 1 - index) * (size + 14);
    const y = name === 'About' ? 29 : height - size - 26;
    ctx.fillStyle = '#172939';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#f7eedc';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);
    const icon = images.get(brand);
    if (icon) {
      ctx.drawImage(
        icon,
        x + size * 0.23,
        y + size * 0.23,
        size * 0.54,
        size * 0.54,
      );
    } else {
      ctx.fillStyle = '#f7eedc';
      ctx.font = 'bold 26px Arial';
      ctx.fillText(brand === 'github' ? 'GH' : 'in', x + 16, y + 19);
    }
    return {
      href,
      bounds: [x / width, y / height, (x + size) / width, (y + size) / height],
    };
  });
}

export function openSurfaceLink(hit) {
  if (!hit?.href) return false;
  window.open(hit.href, '_blank', 'noopener,noreferrer');
  return true;
}
