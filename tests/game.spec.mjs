import { test, expect } from 'playwright/test';
import { parts, views } from '../game/data.mjs';

test('game opens on exterior with all four views and working artwork', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/game.html');
  await expect(page).toHaveTitle(/Aircraft Lab/);
  for (const view of views) {
    await page.getByRole('button', { name: `View ${view.name}`, exact: true }).click();
    await page.locator('#scene-image').evaluate(image => image.decode());
    await expect(page.locator('#scene-title')).toHaveText(view.name);
    await expect(page.locator('.hotspot')).toHaveCount(parts.filter(part => part.view === view.id).length);
  }
  expect(errors).toEqual([]);
});

test('rejects a wrong drop, accepts drag and drop, and restores names and functions', async ({ page }) => {
  await page.goto('/game.html');
  await page.locator('[data-card="aileron"]').click();
  await page.locator('[data-target="flaps"]').click();
  await expect(page.locator('#feedback')).toContainText('Try another spot');
  await expect(page.locator('#match-count')).toHaveText('0');
  await page.locator('[data-card="aileron"]').dragTo(page.locator('[data-target="aileron"]'));
  await expect(page.locator('#match-count')).toHaveText('1');
  await page.getByRole('tab', { name: 'What they do' }).click();
  await page.locator('[data-card="aileron"]').click();
  await page.locator('[data-target="aileron"]').click();
  await expect(page.locator('#match-count')).toHaveText('2');
  await page.reload();
  await expect(page.locator('#match-count')).toHaveText('2');
});

test('zoom is bounded, reset works, and sidebar can collapse', async ({ page }) => {
  await page.goto('/game.html');
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(page.locator('#zoom-level')).toHaveText('125%');
  await page.getByRole('button', { name: 'Reset camera' }).click();
  await expect(page.locator('#zoom-level')).toHaveText('100%');
  await page.locator('#scene').hover({ position: { x: 220, y: 200 } });
  await page.mouse.wheel(0, -100);
  await expect(page.locator('#zoom-level')).toHaveText('115%');
  for (let i = 0; i < 8; i++) await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(page.locator('#zoom-level')).toHaveText('300%');
  await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Reset camera' }).click();
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  await expect(page.locator('#sidebar-toggle')).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Expand sidebar' }).click();
  await expect(page.locator('#sidebar-toggle')).toHaveAttribute('aria-expanded', 'true');
});

test('every part and definition can be matched and completion celebrates forty matches', async ({ page }) => {
  await page.goto('/game.html');
  for (const view of views) {
    await page.getByRole('button', { name: `View ${view.name}`, exact: true }).click();
    for (const mode of ['names', 'functions']) {
      await page.getByRole('tab', { name: mode === 'names' ? 'Part names' : 'What they do' }).click();
      for (const part of parts.filter(part => part.view === view.id)) {
        await page.locator(`[data-card="${part.id}"]`).click();
        await page.locator(`[data-target="${part.id}"]`).click();
      }
    }
  }
  await expect(page.locator('#match-count')).toHaveText('40');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cleared for takeoff!' })).toBeVisible();
});

test('mobile tap placement, hints and field guide work without overflowing', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/game.html');
  await page.getByRole('button', { name: 'View Cabin', exact: true }).click();
  await page.locator('[data-card="seats"]').click();
  await page.getByRole('button', { name: 'Give me a hint' }).click();
  await expect(page.locator('[data-target="seats"]')).toHaveClass(/hinted/);
  await page.locator('[data-target="seats"]').click();
  await expect(page.locator('#match-count')).toHaveText('1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open field guide' }).click();
  await expect(page.getByRole('dialog')).toContainText('Aileron');
});

test('reduced motion and blocked storage leave the game playable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }));
  await page.goto('/game.html');
  await page.locator('[data-card="aileron"]').click();
  await page.locator('[data-target="aileron"]').click();
  await expect(page.locator('#match-count')).toHaveText('1');
  await expect(page.locator('#camera-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('keyboard matching and confirmed reset work without losing progress on cancel', async ({ page }) => {
  await page.goto('/game.html');
  await page.locator('[data-card="aileron"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-target="aileron"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#match-count')).toHaveText('1');
  await page.getByRole('button', { name: 'Start a new game' }).click();
  await page.getByRole('button', { name: 'Keep my progress' }).click();
  await expect(page.locator('#match-count')).toHaveText('1');
  await page.getByRole('button', { name: 'Start a new game' }).click();
  await page.getByRole('button', { name: 'Start fresh', exact: true }).click();
  await expect(page.locator('#match-count')).toHaveText('0');
});

test('real touch drag places a cabin part', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/game.html');
  await page.getByRole('button', { name: 'View Cabin', exact: true }).click();
  await page.locator('[data-card="seats"]').scrollIntoViewIfNeeded();
  const source = await page.locator('[data-card="seats"]').boundingBox();
  const target = await page.locator('[data-target="seats"]').boundingBox();
  const from = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  const to = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
  for (let i = 1; i <= 8; i++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / 8, y: from.y + (to.y - from.y) * i / 8 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('#match-count')).toHaveText('1');
  await context.close();
});

test('all markers can be used on small phones, tablets and large displays', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/game.html');
    await page.getByRole('button', { name: 'View Exterior', exact: true }).click();
    for (const part of parts.filter(part => part.view === 'exterior')) await page.locator(`[data-target="${part.id}"]`).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
