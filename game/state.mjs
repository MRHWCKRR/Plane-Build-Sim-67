import { parts, views } from './data.mjs';
const ids = new Set(parts.map(part => part.id));
const modes = ['names', 'functions'];
export function createState() {
  return { version: 1, view: 'exterior', mode: 'names', matches: { names: [], functions: [] } };
}
export function restoreState(raw) {
  const state = createState();
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object') return state;
    if (views.some(view => view.id === value.view)) state.view = value.view;
    if (modes.includes(value.mode)) state.mode = value.mode;
    for (const mode of modes) if (Array.isArray(value.matches?.[mode])) {
      state.matches[mode] = [...new Set(value.matches[mode].filter(id => ids.has(id)))];
    }
  } catch { /* An interrupted save or unavailable storage starts a fresh session. */ }
  return state;
}
export function countMatches(state, view) {
  return modes.reduce((total, mode) => total + state.matches[mode].filter(id => !view || parts.find(part => part.id === id)?.view === view).length, 0);
}
export function placeCard(state, cardId, targetId, mode) {
  const part = parts.find(part => part.id === targetId);
  if (!modes.includes(mode) || !part || part.view !== state.view || cardId !== targetId) return { correct: false };
  if (state.matches[mode].includes(targetId)) return { correct: true, duplicate: true, part };
  state.matches[mode].push(targetId);
  return { correct: true, duplicate: false, part };
}
