import { test, expect } from 'playwright/test';

test('introduces the game and serves all local artwork without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Plane Build Sim 67/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Build it.');
  await expect(page.getByRole('link', { name: 'Enter the aircraft lab' })).toBeVisible();
  await page.locator('.scroll-cue').click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await page.locator('footer').scrollIntoViewIfNeeded();
  const images = await page.locator('img').evaluateAll(images => Promise.all(images.map(image => new Promise(resolve => {
    if (image.complete) return resolve(image.naturalWidth > 0);
    image.addEventListener('load', () => resolve(true), { once: true });
    image.addEventListener('error', () => resolve(false), { once: true });
  }))));
  expect(images.every(Boolean)).toBe(true);
  expect(errors).toEqual([]);
});

test('scroll moves the airplane and disabling motion persists after reload', async ({ page }) => {
  await page.goto('/');
  const plane = page.locator('[data-flight-plane]');
  const initial = await plane.evaluate(el => getComputedStyle(el).transform);
  await page.locator('#step-name').scrollIntoViewIfNeeded();
  await plane.evaluate(image => image.decode());
  await expect(plane).toBeInViewport();
  await expect.poll(() => plane.evaluate(el => getComputedStyle(el).transform)).not.toBe(initial);
  await page.getByRole('button', { name: 'Turn animations off' }).click();
  await expect(plane).toHaveCSS('transform', 'none');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Turn animations on' })).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#step-fly').scrollIntoViewIfNeeded();
  await expect(plane).toHaveCSS('transform', 'none');
});

test('reduced motion starts with stationary airplanes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#step-name').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-flight-plane]')).toHaveCSS('transform', 'none');
  await expect(page.getByRole('button', { name: 'Animations off: system reduced motion enabled' })).toBeDisabled();
});

test('mobile navigation fits the screen and opens the game', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Play the game' }).click();
  await expect(page).toHaveURL(/game.html$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Aircraft lab');
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});

test('content and links remain useful without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173');
  await expect(page.locator('#step-build h3')).toBeVisible();
  await expect(page.locator('#step-name h3')).toBeVisible();
  await page.locator('.scroll-cue').click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await context.close();
});

test('unavailable local storage does not break motion controls', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage unavailable', 'SecurityError'); } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Turn animations off' }).click();
  await expect(page.getByRole('button', { name: 'Turn animations on' })).toBeVisible();
  await expect(page.locator('[data-flight-plane]')).toHaveCSS('transform', 'none');
});

test('data saving starts with motion disabled', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Turn animations on' })).toBeVisible();
  await expect(page.locator('[data-flight-plane]')).toHaveCSS('transform', 'none');
});

test('small phone, tablet and desktop layouts fit and keep the airplane visible', async ({ page }) => {
  for (const width of [320, 760, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#step-name').scrollIntoViewIfNeeded();
    await page.locator('[data-flight-plane]').evaluate(image => image.decode());
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = await page.locator('[data-flight-plane]').boundingBox();
    expect(box.width).toBeGreaterThan(150);
    await expect(page.locator('[data-flight-plane]')).toBeInViewport();
  }
});
