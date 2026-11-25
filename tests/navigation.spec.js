import { test, expect } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { copy } from '../src/content.js';

test('radial navigation, keyboard dismissal, and mobile reading', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    window.open = (url) => {
      document.body.dataset.openedUrl = url;
    };
  });
  await page.goto('/');
  const toggle = page.locator('#menu-toggle');
  await toggle.click();
  await page.locator('#skip').click();
  await expect(page.locator('#app')).toHaveAttribute('data-state', 'room');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-item="About"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-item="Projects"]')).toBeFocused();
  await page.screenshot({
    path: join(tmpdir(), 'portfolio-radial-mobile.png'),
  });
  for (const item of await page.locator('.radial-item, .dock-button').all()) {
    const box = await item.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(box.y + box.height).toBeLessThanOrEqual(844);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  for (const name of ['About', 'Projects', 'Experience']) {
    await toggle.click();
    await page.locator(`[data-item="${name}"]`).click();
    await expect(page.locator('#app')).toHaveAttribute('data-focus', name);
    await expect(page.locator('#scene-reading')).toBeFocused();
    if (name !== 'Experience')
      await expect(page.locator('#scene-body')).toContainText(copy[name][2]);
    await expect(page.locator('#back-room svg .back-ring')).toHaveCount(1);
    await expect(page.locator('#back-room svg rect')).toHaveCount(0);
    await expect(page.locator('#details')).toBeHidden();
    await page.waitForTimeout(250);
    await page.screenshot({
      path: join(tmpdir(), `portfolio-mobile-inspect-${name}.png`),
    });
    if (name === 'Projects') {
      await page.mouse.click(341, 528);
      await expect(page.locator('body')).toHaveAttribute(
        'data-opened-url',
        'https://github.com/yparmar2024/morf',
      );
      for (const repo of ['graphos', 'SleepyU']) {
        await page.locator('#next-page').click();
        await expect(page.locator('#project-link')).toHaveAttribute(
          'href',
          'https://github.com/yparmar2024/' + repo,
        );
      }
      await expect(page.locator('#next-page')).toBeDisabled();
      await page.locator('#prev-page').click();
      await expect(page.locator('#scene-title')).toHaveText('Graphos');
    }
    if (name === 'About') {
      await page.mouse.click(331, 265);
      await expect(page.locator('body')).toHaveAttribute(
        'data-opened-url',
        'https://www.github.com/yparmar2024',
      );
      await page.locator('#scene-reading').focus();
      await page.keyboard.press('Tab');
      await expect(page.locator('#linkedin-link')).toBeFocused();
      await expect(
        page.getByRole('link', { name: 'LinkedIn' }),
      ).toHaveAttribute('href', 'https://www.linkedin.com/in/yparmar');
      await expect(
        page.getByRole('link', { name: 'GitHub', exact: true }),
      ).toHaveAttribute('href', 'https://www.github.com/yparmar2024');
      await expect(page.getByRole('link', { name: 'Email Yash' })).toHaveCount(
        0,
      );
      await expect(page.locator('#scene-body')).toContainText(
        'yparmar[at]gmail[dot]com',
      );
    }
    if (name === 'Experience') {
      await expect(page.locator('#page-tools')).toBeHidden();
      await expect(page.locator('[data-name="Experience"]')).toBeHidden();
      await expect(page.locator('.experience-note')).toHaveCount(0);
      await expect(page.locator('#scene-body')).toContainText(
        'Quantum Pulse Consulting',
      );
      await expect(page.locator('#scene-body')).toContainText('KION Group');
    }
    await expect(
      page.locator('[data-item="Records"], [data-name="Records"]'),
    ).toHaveCount(0);
    // Closing the wheel must not also back out of the inspected object.
    await toggle.click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#app')).toHaveAttribute('data-focus', name);
    await page.keyboard.press('Escape');
    await expect(page.locator('#app')).toHaveAttribute('data-focus', '');
  }
  await toggle.click();
  await toggle.click();
  await expect(page.locator('#menu')).toBeHidden();
  await page.locator('#help').click();
  await expect(page.locator('#details')).toBeVisible();
  await expect(page.locator('#detail-body')).toBeHidden();
  await expect(page.locator('.control-row')).toHaveCount(6);
  await expect(page.locator('.guide-triangle + span')).toHaveText('One tap');
  await expect(page.locator('.guide-square').locator('..')).toContainText(
    'Keep tapping',
  );
  await expect(page.locator('#control-guide')).toContainText('progress drains');
  await expect(page.locator('.guide-circle svg circle')).toHaveCount(1);
  await page.screenshot({ path: join(tmpdir(), 'portfolio-help-mobile.png') });
  await page.setViewportSize({ width: 320, height: 568 });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.screenshot({ path: join(tmpdir(), 'portfolio-help-narrow.png') });
  expect(
    await page
      .locator('#details')
      .evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth),
  ).toBe(true);
  await page.locator('.guide-notes').scrollIntoViewIfNeeded();
  await expect(page.locator('.guide-notes')).toBeInViewport();
  await expect(page.locator('#close')).toBeInViewport();
  await page.screenshot({
    path: join(tmpdir(), 'portfolio-help-narrow-scrolled.png'),
  });
  await page.locator('#close').click();
  await expect(page.locator('#help')).toBeFocused();
  await page.locator('#help').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#help')).toBeFocused();
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await toggle.click();
    for (const item of await page.locator('.radial-item, .dock-button').all()) {
      const bounds = await item.boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
      expect(Math.min(bounds.width, bounds.height)).toBeGreaterThanOrEqual(44);
    }
    await toggle.click();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await toggle.click();
  await page.screenshot({
    path: join(tmpdir(), 'portfolio-radial-desktop.png'),
  });
  await page.mouse.click(50, 50);
  await expect(page.locator('#menu')).toBeHidden();
  await page.locator('#help').click();
  await page.screenshot({ path: join(tmpdir(), 'portfolio-help-desktop.png') });
});
