// Run with the Vite server available. The identical renderer paints browser
// surfaces and these packed Blender source textures; no preview route is shipped.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage();
  await page.route('**/__print-authoring', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><body></body></html>',
    }),
  );
  await page.goto('http://localhost:5173/__print-authoring');
  const prints = await page.evaluate(async () => {
    const { drawScenePrint, printSizes } = await import('/src/scene-print.js');
    const { loadBoardLogos } = await import('/src/experience-board.js');
    const { loadSurfaceIcons } = await import('/src/surface-links.js');
    await Promise.all([loadBoardLogos(), loadSurfaceIcons()]);
    return Object.keys(printSizes).map((name) => [
      name,
      drawScenePrint(name).canvas.toDataURL('image/png').split(',')[1],
    ]);
  });
  const directory = new URL(
    '../context/models/room/textures/',
    import.meta.url,
  );
  await mkdir(directory, { recursive: true });
  for (const [name, data] of prints) {
    await writeFile(
      new URL(`content-${name.toLowerCase()}.png`, directory),
      Buffer.from(data, 'base64'),
    );
    console.log(`Updated ${name} print`);
  }
} finally {
  await browser.close();
}
