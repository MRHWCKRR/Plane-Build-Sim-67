import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parts, views } from '../game/data.mjs';
import { createState, placeCard, restoreState, countMatches } from '../game/state.mjs';

test('all requested airplane areas have names and unique definitions', () => {
  assert.equal(views.length, 4);
  assert.equal(parts.length, 20);
  assert.equal(new Set(parts.map(p => p.id)).size, 20);
  assert.equal(new Set(parts.map(p => p.definition)).size, 20);
  for (const name of ['Aileron', 'Slats', 'Flaps', 'Spoiler', 'Winglets', 'Cockpit', 'Fuselage', 'Windows', 'Landing gear', 'Pilot', 'Vertical stabilizer', 'Horizontal stabilizer', 'Rudder', 'Elevator', 'Turbofan engines', 'Seats', 'Cabin lights', 'Control yoke', 'Thrust levers', 'Primary flight display']) assert.ok(parts.some(p => p.name === name), name);
  assert.ok(parts.every(p => views.some(v => v.id === p.view) && p.x > 0 && p.x < 100 && p.y > 0 && p.y < 100));
});

test('wrong parts and cross-view drops never award progress', () => {
  const state = createState();
  assert.equal(placeCard(state, 'aileron', 'flaps', 'names').correct, false);
  assert.equal(placeCard(state, 'seats', 'seats', 'names').correct, false);
  assert.equal(countMatches(state), 0);
});

test('names and functions score separately and repeated drops do not score twice', () => {
  const state = createState();
  assert.equal(placeCard(state, 'aileron', 'aileron', 'names').correct, true);
  assert.equal(countMatches(state), 1);
  assert.equal(placeCard(state, 'aileron', 'aileron', 'names').duplicate, true);
  assert.equal(countMatches(state), 1);
  assert.equal(placeCard(state, 'aileron', 'aileron', 'functions').correct, true);
  assert.equal(countMatches(state), 2);
});

test('all forty matches across four views can be completed and restored', () => {
  const state = createState();
  for (const view of views) {
    state.view = view.id;
    for (const part of parts.filter(p => p.view === view.id)) for (const mode of ['names', 'functions']) placeCard(state, part.id, part.id, mode);
  }
  assert.equal(countMatches(state), 40);
  assert.equal(countMatches(restoreState(JSON.stringify(state))), 40);
});

test('invalid saved data falls back safely and rejects unknown matches and modes', () => {
  assert.deepEqual(restoreState('not json'), createState());
  assert.deepEqual(restoreState('null'), createState());
  const state = restoreState(JSON.stringify({view:'missing',mode:'unsafe',matches:{names:['aileron','aileron','bogus'],functions:['bogus']}}));
  assert.equal(state.view, 'exterior');
  assert.equal(state.mode, 'names');
  assert.equal(countMatches(state), 1);
  assert.equal(placeCard(state, 'aileron', 'aileron', '__proto__').correct, false);
});
