import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aircraft, getParts, getViews } from '../game/fleet.mjs';
import { createState, restoreFleet, placeCard, countMatches } from '../game/state.mjs';

test('aircraft have appropriate parts and no passenger cabin on the fighter', () => {
  assert.equal(aircraft.length, 4);
  assert.equal(getParts('787').find(p => p.id === 'winglets').name, 'Raked wingtips');
  assert.equal(getParts('a220').find(p => p.id === 'yoke').name, 'Sidestick');
  assert.equal(getViews('hornet').some(v => v.id === 'cabin'), false);
  assert.equal(getParts('hornet').some(p => p.id === 'elevator'), false);
  assert.equal(getParts('hornet').find(p => p.id === 'horizontal-stabilizer').name, 'Stabilator');
  assert.ok(getParts('hornet').every(p => p.view !== 'cabin'));
});

test('old progress migrates to the 737 and different aircraft retain independent progress', () => {
  const old = JSON.stringify({view:'tail',mode:'names',matches:{names:['aileron'],functions:[]}});
  const fleet = restoreFleet(null, old);
  assert.equal(countMatches(fleet.progress['737']), 1);
  assert.equal(countMatches(fleet.progress['787']), 0);
  fleet.active = '787';
  placeCard(fleet.progress['787'], 'aileron', 'aileron', 'names');
  const loaded = restoreFleet(JSON.stringify(fleet));
  assert.equal(loaded.active, '787');
  assert.equal(countMatches(loaded.progress['737']), 1);
  assert.equal(countMatches(loaded.progress['787']), 1);
});

test('each aircraft can be fully completed using only its own available parts', () => {
  for (const plane of aircraft) {
    const state = createState(plane.id);
    for (const part of getParts(plane.id)) {
      state.view = part.view;
      for (const mode of ['names','functions']) assert.equal(placeCard(state,part.id,part.id,mode).correct,true);
    }
    assert.equal(countMatches(state),getParts(plane.id).length*2);
  }
});

test('corrupt fleet data cannot introduce unknown aircraft, views or removed parts', () => {
  const fleet = restoreFleet(JSON.stringify({active:'unknown',progress:{hornet:{view:'cabin',matches:{names:['winglets','elevator','aileron'],functions:[]}}}}));
  assert.equal(fleet.active,'737');
  assert.equal(fleet.progress.hornet.view,'exterior');
  assert.equal(countMatches(fleet.progress.hornet),1);
});
