import { test, expect } from '@playwright/test';

test('personalized print fits every surface in desktop and portrait layouts', async ({
  page,
}) => {
  await page.route('**/__print-check', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><body></body></html>',
    }),
  );
  await page.goto('/__print-check');
  const prints = await page.evaluate(async () => {
    const { drawScenePrint, printSizes } = await import('/src/scene-print.js');
    const { copy } = await import('/src/content.js');
    const original = CanvasRenderingContext2D.prototype.fillText;
    let drawn;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y) {
      const size = Number(this.font.match(/([\d.]+)px/)[1]);
      drawn.push({ text, x, y, size, right: x + this.measureText(text).width });
      original.call(this, text, x, y);
    };
    const results = [];
    try {
      for (const compact of [false, true]) {
        for (const name of Object.keys(printSizes)) {
          drawn = [];
          const { canvas } = drawScenePrint(name, compact);
          results.push({
            name,
            compact,
            width: canvas.width,
            height: canvas.height,
            drawn,
            bodyStart: copy[name][2].split(' ')[0],
          });
        }
      }
    } finally {
      CanvasRenderingContext2D.prototype.fillText = original;
    }
    return results;
  });
  for (const print of prints) {
    for (const line of print.drawn) {
      expect(line.x, `${print.name}: ${line.text}`).toBeGreaterThanOrEqual(0);
      expect(line.right, `${print.name}: ${line.text}`).toBeLessThanOrEqual(
        print.width,
      );
      expect(
        line.y + line.size,
        `${print.name}: ${line.text}`,
      ).toBeLessThanOrEqual(print.height - 10);
    }
    if (print.name === 'Experience') continue;
    const firstBody = print.drawn.find((line) =>
      line.text.startsWith(print.bodyStart),
    );
    expect(
      firstBody.size,
      `${print.name} print legibility`,
    ).toBeGreaterThanOrEqual(print.compact && print.name !== 'About' ? 52 : 40);
  }
});
