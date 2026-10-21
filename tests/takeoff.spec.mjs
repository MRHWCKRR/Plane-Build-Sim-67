import { test, expect } from 'playwright/test';
import { departureSteps } from '../game/departure.mjs';
import { aircraft, getParts } from '../game/fleet.mjs';

async function nearlyComplete(page, id, missingCount = 1) {
  const parts = getParts(id);
  const missing = parts.slice(-missingCount);
  await page.addInitScript(({id, parts, missing}) => {
    if (localStorage.getItem('pbs67-fleet-v1')) return;
    localStorage.setItem('pbs67-fleet-v1', JSON.stringify({active:id,progress:{[id]:{aircraft:id,view:missing[0].view,mode:'functions',matches:{names:parts.map(p=>p.id),functions:parts.filter(p=>!missing.some(m=>m.id===p.id)).map(p=>p.id)}}}}));
  }, {id, parts, missing});
  await page.goto('/game.html');
  return missing;
}
async function match(page, part) {
  await page.locator(`[data-view="${part.view}"]`).click();
  await page.locator(`[data-card="${part.id}"]`).click();
  await page.locator(`[data-target="${part.id}"]`).click();
}
async function seekFlight(page, time) {
  await page.locator('.takeoff').evaluate((root,time) => { for (const animation of root.getAnimations({subtree:true})) animation.currentTime = time; }, time);
}

for (const plane of aircraft) test(`${plane.name} prepares, accelerates and takes off after the final definition`, async ({page}) => {
  const [last] = await nearlyComplete(page, plane.id);
  await expect(page.locator('.takeoff')).toHaveCount(0);
  await match(page,last);
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','preparing');
  await expect(page.locator('.takeoff-plane')).toHaveAttribute('src',`/assets/game/takeoff/${plane.id}.webp`);
  for (const step of departureSteps(plane.id).slice(1,-1)) {
    await seekFlight(page,step.at+200);
    await expect(page.locator('.takeoff')).toHaveAttribute('data-stage',step.id);
    await expect(page.locator('.takeoff-status')).toHaveText(step.title);
    if (step.id === 'climbing') await expect(page.locator('.system-gear')).toHaveText('Gear: down');
    if (step.id === 'gear') await expect(page.locator('.system-gear')).toHaveText('Gear: retracting');
    if (step.id === 'cleanup') {
      await expect(page.locator('.system-gear')).toHaveText('Gear: up');
      await expect(page.locator('.takeoff-gear-up')).toHaveCSS('opacity','1');
      await expect(page.locator('.takeoff-plane')).toHaveCSS('opacity','0');
    }
  }
  await page.locator('.takeoff-airframe').evaluate(plane=>plane.getAnimations()[0].finish());
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','airborne');
  await expect(page.getByRole('button',{name:'Replay takeoff'})).toBeVisible();
  await expect(page.locator('#match-count')).toHaveText(String(getParts(plane.id).length*2));
});

test('takeoff waits for every definition; skipping, replaying and closing preserve progress',async({page})=>{
  const missing = await nearlyComplete(page,'737',2);
  await match(page,missing[0]);
  await expect(page.locator('.takeoff')).toHaveCount(0);
  await match(page,missing[1]);
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','preparing');
  await page.getByRole('button',{name:'Skip animation'}).click();
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','airborne');
  await page.getByRole('button',{name:'Replay takeoff'}).click();
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','preparing');
  await page.getByRole('button',{name:'Keep exploring'}).click();
  expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.effect?.target?.closest('.takeoff')).length)).toBe(0);
  await expect(page.locator('#match-count')).toHaveText('40');
  await page.reload();
  await expect(page.locator('#match-count')).toHaveText('40');
  await page.getByRole('button',{name:'Watch your takeoff'}).click();
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','preparing');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('reduced motion shows a static departure on small screens',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:320,height:740});
  const [last]=await nearlyComplete(page,'f16');
  await match(page,last);
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','airborne');
  await expect(page.getByRole('button',{name:'Skip animation'})).toBeHidden();
  expect(await page.locator('.takeoff-airframe').evaluate(img=>img.getAnimations().length)).toBe(0);
  expect(await page.getByRole('dialog').evaluate(d=>d.scrollWidth<=d.clientWidth)).toBe(true);
});

test('changing motion preference stops a running flight',async({page})=>{
  const [last]=await nearlyComplete(page,'747');
  await match(page,last);
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','preparing');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','airborne');
  expect(await page.locator('.takeoff-airframe').evaluate(img=>img.getAnimations().length)).toBe(0);
});


test('unavailable takeoff artwork leaves the report usable',async({page})=>{
  await page.route('**/assets/game/takeoff/*.webp',route=>route.abort());
  const [last]=await nearlyComplete(page,'737');
  await match(page,last);
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','airborne');
  await expect(page.locator('.takeoff-detail')).toContainText('image could not load');
  await page.getByRole('button',{name:'Keep exploring'}).click();
  await expect(page.locator('#match-count')).toHaveText('40');
});


test('pause holds the sequence and the full explanation remains readable',async({page})=>{
  const [last]=await nearlyComplete(page,'737');
  await match(page,last);
  await expect(page.locator('.takeoff')).toHaveAttribute('data-stage','preparing');
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  expect(await page.locator('.takeoff-airframe').evaluate(el=>el.getAnimations()[0].playState)).toBe('paused');
  await page.getByText('Read the takeoff steps',{exact:true}).click();
  await expect(page.locator('.takeoff-explained')).toContainText('Gear indications confirm retraction');
  await expect(page.locator('.takeoff-explained')).toContainText('retracts them in stages');
  await page.getByRole('button',{name:'Resume',exact:true}).click();
  expect(await page.locator('.takeoff-airframe').evaluate(el=>el.getAnimations()[0].playState)).toBe('running');
});
