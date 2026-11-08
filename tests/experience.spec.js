import { test, expect } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('3D opening, momentum, camera entry, details and replay', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'paper');
  await expect(page.locator('#fallback')).toBeHidden();
  await expect(page.locator('#app')).toHaveAttribute(
    'data-paper-ready',
    'true',
  );
  await page.screenshot({ path: join(tmpdir(), 'portfolio-exterior.png') });
  // Batch rapid inputs in one browser task: software WebGL frames can exceed the decay interval.
  await page.locator('#action').evaluate((b) => {
    b.click();
    b.click();
    b.click();
  });
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'window');
  await page.screenshot({ path: join(tmpdir(), 'portfolio-window.png') });
  await page.locator('#action').evaluate((b) => {
    for (let i = 0; i < 5; i++) b.click();
  });
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'room');
  await page.screenshot({ path: join(tmpdir(), 'portfolio-room.png') });
  await page.locator('#menu-toggle').click();
  await page.locator('[data-item="About"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-focus', 'About');
  await expect(page.locator('#details')).not.toBeVisible();
  await page.locator('#read-object').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('#back-room').click();
  await page.reload();
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'room');
  await page.locator('#menu-toggle').click();
  await page.locator('#replay').click();
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'paper');
  expect(errors).toEqual([]);
});

test('mobile reduced motion and skip during transition', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'paper');
  await page.screenshot({ path: join(tmpdir(), 'portfolio-mobile.png') });
  await page.locator('#action').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'window');
  await page.keyboard.press('Space');
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'room');
  await page.screenshot({ path: join(tmpdir(), 'portfolio-mobile-room.png') });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator('#menu-toggle').click();
  await page.locator('#replay').click();
  await page.locator('#menu-toggle').click();
  await page.locator('#skip').click();
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'room');
});

test('storage failure, narrow viewport, help and unavailable WebGL', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('storage blocked');
    };
    Storage.prototype.setItem = () => {
      throw new Error('storage blocked');
    };
  });
  await page.goto('/');
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'paper');
  await page.locator('#menu-toggle').click();
  await page.locator('#skip').click();
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'room');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator('#menu-toggle').click();
  await page.locator('#help').click();
  await expect(page.locator('#details')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl2' ? null : original.call(this, type, ...args);
    };
  });
  await page.reload();
  await expect(page.locator('#fallback')).toBeVisible();
  await page.locator('#fallback-about').click();
  await expect(page.locator('#detail-title')).toHaveText('Hey, I’m Yash.');
});

test('immersive prompts and broad object tapping', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto('/');
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'paper');
  await expect(page.locator('#app')).toHaveAttribute(
    'data-paper-ready',
    'true',
  );
  await expect(page.locator('header, .caption, .chapter')).toHaveCount(0);
  await page.mouse.click(20, 20);
  await expect(page.locator('progress')).toHaveAttribute('value', '0');
  // A broad central name-tag hit activates it, without touching the prompt below.
  await page.locator('#world').evaluate((canvas) => {
    for (let i = 0; i < 3; i++)
      canvas.dispatchEvent(
        new MouseEvent('click', { clientX: 500, clientY: 400, bubbles: true }),
      );
  });
  await expect(page.locator('#action')).toHaveAttribute(
    'data-complete',
    'true',
  );
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'window');
  await page.mouse.click(20, 20);
  await expect(page.locator('progress')).toHaveAttribute('value', '0');
  await page.locator('#world').evaluate((canvas) => {
    for (let i = 0; i < 5; i++)
      canvas.dispatchEvent(
        new MouseEvent('click', { clientX: 500, clientY: 400, bubbles: true }),
      );
  });
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'room');
  await expect(page.locator('#app')).toHaveAttribute('data-room-ready', 'true');
  await page.locator('#menu-toggle').click();
  await page.locator('[data-item=About]').click();
  await expect(page.locator('#inspect-controls')).toBeVisible();
});

test('Blender room inspection, return, and model-load failure', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('yp-3d-entered', '1'));
  await page.goto('/');
  await expect(page.locator('#app')).toHaveAttribute('data-room-ready', 'true');
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'room');
  // Use the projected notebook location but dispatch to the canvas: exercise
  // actual GLB raycasting rather than the DOM hotspot's click handler.
  const notebook = page.locator('[data-name="Projects"]');
  await expect(notebook).toBeVisible();
  await expect(notebook).toHaveAttribute('style', /left:/);
  const box = await notebook.boundingBox();
  await page.locator('#world').dispatchEvent('click', {
    clientX: box.x + box.width / 2,
    clientY: box.y + box.height / 2,
  });
  await expect(page.locator('#app')).toHaveAttribute('data-focus', 'Projects');
  await page.keyboard.press('Escape');
  await expect(page.locator('#inspect-controls')).toBeHidden();
  for (const name of ['About', 'Projects', 'Experience', 'Records']) {
    await page.locator('#menu-toggle').click();
    await page.locator(`[data-item="${name}"]`).click();
    await expect(page.locator('#app')).toHaveAttribute('data-focus', name);
    await page.waitForTimeout(200);
    await page.screenshot({
      path: join(tmpdir(), `portfolio-inspect-${name}.png`),
    });
    await page.locator('#read-object').click();
    await expect(page.locator('#details')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.locator('#back-room').click();
    await expect(page.locator('#app')).toHaveAttribute('data-focus', '');
  }
  await page.route('**/models/room-draft.glb', (route) => route.abort());
  await page.reload();
  await expect(page.locator('#fallback')).toBeVisible();
  await expect(page.locator('#loading')).toBeHidden();
  await page.locator('#fallback-about').click();
  await expect(page.locator('#detail-title')).toHaveText('Hey, I’m Yash.');
});
