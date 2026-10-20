import { aircraft, getAircraft, getParts, getViews } from './fleet.mjs';
const modes = ['names', 'functions'];
export function createState(id = '737') {
  return { version: 1, aircraft: getAircraft(id).id, view: 'exterior', mode: 'names', matches: { names: [], functions: [] } };
}
export function restoreState(raw) {
  let state = createState();
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object') return state;
    state = createState(value.aircraft);
    const ids = new Set(getParts(state.aircraft).map(part => part.id));
    if (getViews(state.aircraft).some(view => view.id === value.view)) state.view = value.view;
    if (modes.includes(value.mode)) state.mode = value.mode;
    for (const mode of modes) if (Array.isArray(value.matches?.[mode])) state.matches[mode] = [...new Set(value.matches[mode].filter(id => ids.has(id)))];
  } catch { /* Invalid or interrupted saves start a fresh session. */ }
  return state;
}
export function restoreFleet(raw, legacyRaw = null) {
  const fleet = { active: '737', progress: Object.fromEntries(aircraft.map(plane => [plane.id, createState(plane.id)])) };
  try {
    const value = JSON.parse(raw);
    if (value && typeof value === 'object') {
      fleet.active = getAircraft(value.active).id;
      for (const plane of aircraft) if (value.progress?.[plane.id] && typeof value.progress[plane.id] === 'object') {
        fleet.progress[plane.id] = restoreState(JSON.stringify({ ...value.progress[plane.id], aircraft: plane.id }));
      }
      return fleet;
    }
  } catch { /* Try the previous single-aircraft save below. */ }
  if (legacyRaw) fleet.progress['737'] = restoreState(legacyRaw);
  return fleet;
}
export function countMatches(state, view) {
  const parts = getParts(state.aircraft);
  return modes.reduce((total, mode) => total + state.matches[mode].filter(id => parts.some(part => part.id === id && (!view || part.view === view))).length, 0);
}
export function placeCard(state, cardId, targetId, mode) {
  const part = getParts(state.aircraft).find(part => part.id === targetId);
  if (!modes.includes(mode) || !part || part.view !== state.view || cardId !== targetId) return { correct: false };
  if (state.matches[mode].includes(targetId)) return { correct: true, duplicate: true, part };
  state.matches[mode].push(targetId);
  return { correct: true, duplicate: false, part };
}
