import { test, expect } from 'playwright/test';
import { aircraft, getParts, getViews } from '../game/fleet.mjs';

test('text-only cards show brief notes without moving the drop targets', async ({ page }) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/game.html');
  await expect(page.locator('.part-card img,.card-photo')).toHaveCount(0);
  await expect(page.getByText('EXPLORE. MATCH. DISCOVER.',{exact:true})).toHaveCount(0);
  const before = await page.locator('[data-target="aileron"]').boundingBox();
  await page.locator('[data-card="aileron"]').click();
  await expect(page.locator('#part-notes')).toBeVisible();
  await expect(page.locator('#part-note-title')).toHaveText('Aileron');
  expect((await page.locator('#part-history').textContent()).length).toBeLessThan(120);
  expect((await page.locator('#part-fact').textContent()).length).toBeLessThan(120);
  const after = await page.locator('[data-target="aileron"]').boundingBox();
  expect(after.width).toBeCloseTo(before.width,0);
  await page.getByRole('tab',{name:'What they do'}).click();
  await page.locator('[data-card="aileron"]').click();
  await expect(page.locator('#part-notes')).toBeHidden();
});

test('aircraft switching saves independent progress and restores the selected plane', async ({ page }) => {
  await page.goto('/game.html');
  await page.locator('[data-card="aileron"]').click();
  await page.locator('[data-target="aileron"]').click();
  await page.getByRole('button',{name:'Fly Boeing 787',exact:true}).click();
  await expect(page.locator('#match-count')).toHaveText('0');
  await expect(page.locator('#active-aircraft')).toHaveText('Boeing 787');
  await expect(page.locator('#scene-image')).toHaveAttribute('src',/787\/exterior/);
  await page.locator('[data-card="flaps"]').click();
  await page.locator('[data-target="flaps"]').click();
  await page.getByRole('button',{name:'Fly Boeing 737',exact:true}).click();
  await expect(page.locator('#match-count')).toHaveText('1');
  await expect(page.locator('[data-card="aileron"]')).toHaveCount(0);
  await page.getByRole('button',{name:'Fly Boeing 787',exact:true}).click();
  await page.reload();
  await expect(page.locator('#active-aircraft')).toHaveText('Boeing 787');
  await expect(page.locator('#match-count')).toHaveText('1');
  await expect(page.locator('[data-card="flaps"]')).toHaveCount(0);
});

for (const plane of aircraft.filter(plane=>plane.id!=='737')) test(`${plane.name} loads every scene and completes its own parts`, async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/game.html');
  await page.getByRole('button',{name:`Fly ${plane.name}`,exact:true}).click();
  for(const view of getViews(plane.id)) {
    await page.getByRole('button',{name:`View ${view.name}`,exact:true}).click();
    await page.locator('#scene-image').evaluate(image=>image.decode());
    for(const mode of ['names','functions']) {
      await page.getByRole('tab',{name:mode==='names'?'Part names':'What they do'}).click();
      for(const part of getParts(plane.id).filter(part=>part.view===view.id)) {
        await page.locator(`[data-card="${part.id}"]`).click();
        await page.locator(`[data-target="${part.id}"]`).click();
      }
    }
  }
  await expect(page.locator('#match-count')).toHaveText(String(getParts(plane.id).length*2));
  await expect(page.getByRole('heading',{name:'Cleared for takeoff!'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile aircraft picker supports fighter views and compact part notes', async ({ page }) => {
  await page.setViewportSize({width:375,height:812});
  await page.goto('/game.html');
  await page.getByRole('combobox',{name:'Choose aircraft'}).selectOption('hornet');
  await expect(page.getByRole('button',{name:'View Cabin',exact:true})).toHaveCount(0);
  await page.locator('[data-card="aileron"]').click();
  await expect(page.locator('#part-note-title')).toHaveText('Aileron');
  await page.getByRole('button',{name:'Close part notes'}).click();
  await page.locator('[data-target="aileron"]').click();
  await expect(page.locator('#match-count')).toHaveText('1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
