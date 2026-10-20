import { SOURCE_URL } from './data.mjs';
import { aircraft, getAircraft, getParts, getViews, sceneBase } from './fleet.mjs';
import { factsFor } from './facts.mjs';
import { createState, restoreFleet, placeCard, countMatches } from './state.mjs';

const $ = selector => document.querySelector(selector);
const STORAGE_KEY = 'pbs67-fleet-v1';
let fleet = restoreFleet(null);
try { fleet = restoreFleet(localStorage.getItem(STORAGE_KEY), localStorage.getItem('pbs67-game-v1')); } catch { /* Playable without storage. */ }
let state = fleet.progress[fleet.active];
const allParts = () => getParts(state.aircraft);
const availableViews = () => getViews(state.aircraft);
const totalMatches = () => allParts().length * 2;
let selected = null;
let zoom = 1;
let pointer = { x: 0, y: 0 };
let framePending = false;
let dragging = false;
let cardDrag = null;
let dragGhost = null;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let cameraEnabled = !reducedMotion.matches && !navigator.connection?.saveData;
const orders = new Map();
const scene = $('#scene');
const world = $('#scene-world');
const sceneImage = $('#scene-image');
const loading = $('#scene-loading');
const deck = $('#card-deck');
const feedback = $('#feedback');
const dialog = $('#info-dialog');
const cameraToggle = $('#camera-toggle');
let resizeObserver;

function save() {
  try {
    fleet.active = state.aircraft;
    fleet.progress[state.aircraft] = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
    $('#save-status').textContent = 'Progress saved on this device';
  } catch {
    $('#save-status').textContent = 'Playing without saving';
  }
}

function say(text, type = '') {
  feedback.textContent = text;
  feedback.className = type;
}

function currentParts() { return allParts().filter(part => part.view === state.view); }
function isMatched(id, mode = state.mode) { return state.matches[mode].includes(id); }

function showPartNotes(part) {
  const notes = factsFor(part, state.aircraft);
  if (!notes) return;
  $('#part-note-title').textContent = part.name;
  $('#part-history').textContent = notes[0];
  $('#part-fact').textContent = notes[1];
  $('#part-source').href = notes[2];
  $('#part-notes').hidden = false;
}

function renderAircraftPicker() {
  $('#aircraft-buttons').innerHTML = aircraft.map(plane => `<button class="aircraft-button" data-aircraft="${plane.id}" aria-label="Fly ${plane.name}" aria-pressed="${plane.id === state.aircraft}"><span class="plane-code">${plane.short}</span><span class="sidebar-text">${plane.name}<small>${plane.description}</small></span></button>`).join('');
  $('#mobile-aircraft').innerHTML = aircraft.map(plane => `<option value="${plane.id}">${plane.name}</option>`).join('');
  $('#mobile-aircraft').value = state.aircraft;
  $('#active-aircraft').textContent = getAircraft(state.aircraft).name;
}

function switchAircraft(id) {
  if (!aircraft.some(plane => plane.id === id)) return;
  save();
  dragGhost?.remove();
  dragGhost = null;
  cardDrag = null;
  dragging = false;
  fleet.active = id;
  state = fleet.progress[id];
  renderAircraftPicker();
  viewButtons();
  switchView(state.view);
}

function viewButtons() {
  $('#view-buttons').innerHTML = availableViews().map(view => `<button type="button" class="view-button" data-view="${view.id}" aria-label="View ${view.name}" aria-pressed="${view.id === state.view}"><img class="view-thumb" src="${sceneBase(state.aircraft, view.id)}-thumb.webp" alt="" width="24" height="18"><span>${view.name}</span><span class="view-count">0/0</span></button>`).join('');
}

function renderMarkers() {
  const fragment = document.createDocumentFragment();
  for (const [index, part] of currentParts().entries()) {
    const dx = part.dx || 0;
    const dy = part.dy || 0;
    const dot = document.createElement('span');
    dot.className = 'anchor-dot';
    dot.style.cssText = `left:${part.x}%;top:${part.y}%;`;
    dot.setAttribute('aria-hidden', 'true');
    fragment.append(dot);
    if (dx || dy) {
      const line = document.createElement('span');
      line.className = 'leader';
      const length = Math.hypot(dx, dy / 1.5);
      const angle = Math.atan2(dy / 1.5, dx) * 180 / Math.PI;
      line.style.cssText = `left:${part.x}%;top:${part.y}%;width:${length}%;transform:rotate(${angle}deg);`;
      line.setAttribute('aria-hidden', 'true');
      fragment.append(line);
    }
    const button = document.createElement('button');
    button.className = 'hotspot';
    button.type = 'button';
    button.dataset.target = part.id;
    button.dataset.number = String(index + 1).padStart(2, '0');
    button.style.cssText = `left:${part.x + dx}%;top:${part.y + dy}%;`;
    const number = document.createElement('span');
    number.className = 'hotspot-number';
    number.textContent = button.dataset.number;
    const label = document.createElement('span');
    label.className = 'hotspot-label';
    label.textContent = `Spot ${button.dataset.number}`;
    button.append(number, label);
    fragment.append(button);
  }
  $('#hotspots').replaceChildren(fragment);
}

function shuffledIds() {
  const key = `${state.aircraft}:${state.view}:${state.mode}`;
  if (!orders.has(key)) {
    const ids = currentParts().map(part => part.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    orders.set(key, ids);
  }
  return orders.get(key);
}

function renderCards() {
  const remaining = shuffledIds().filter(id => !isMatched(id));
  const fragment = document.createDocumentFragment();
  for (const id of remaining) {
    const part = allParts().find(item => item.id === id);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `part-card${state.mode === 'functions' ? ' definition-card' : ''}`;
    card.dataset.card = part.id;
    card.draggable = false;
    card.setAttribute('aria-pressed', 'false');
    const text = state.mode === 'names' ? part.name : part.definition;
    card.setAttribute('aria-label', `Select ${text}`);
    const grip = document.createElement('span');
    grip.className = 'card-grip';
    grip.textContent = '⠿';
    grip.setAttribute('aria-hidden', 'true');
    card.append(grip);
    const label = document.createElement('span');
    label.className = 'card-name';
    label.textContent = text;
    card.append(label);
    fragment.append(card);
  }
  if (!remaining.length) {
    const box = document.createElement('div');
    box.className = 'deck-complete';
    const text = document.createElement('p');
    const action = document.createElement('button');
    if (countMatches(state) === totalMatches()) {
      text.textContent = 'Every part. Every purpose. You know your aircraft!';
      action.textContent = 'Your flight report ↗';
      action.addEventListener('click', showCompletion);
    } else {
      const otherMode = state.mode === 'names' ? 'functions' : 'names';
      if (currentParts().some(part => !isMatched(part.id, otherMode))) {
        text.textContent = state.mode === 'names' ? 'Names mastered. Ready to discover what they do?' : 'Functions matched. Now give those parts a name.';
        action.textContent = otherMode === 'names' ? 'Match the names →' : 'Match their functions →';
        action.addEventListener('click', () => switchMode(otherMode));
      } else {
        text.textContent = 'This view is complete. A new perspective is waiting.';
        action.textContent = 'Explore the next view →';
        action.addEventListener('click', () => {
          const next = availableViews().find(view => countMatches(state, view.id) < allParts().filter(part => part.view === view.id).length * 2);
          if (next) switchView(next.id);
        });
      }
    }
    box.append(text, action);
    fragment.append(box);
  }
  deck.replaceChildren(fragment);
  $('#remaining-count').textContent = `${remaining.length} left in this view`;
  deck.setAttribute('aria-labelledby', state.mode === 'names' ? 'names-tab' : 'functions-tab');
  requestAnimationFrame(updateDeckControls);
  for (const tab of document.querySelectorAll('[data-mode]')) {
    tab.setAttribute('aria-selected', String(tab.dataset.mode === state.mode));
    tab.tabIndex = tab.dataset.mode === state.mode ? 0 : -1;
  }
}

function updateDeckControls() {
  $('#cards-back').disabled = deck.scrollLeft <= 1;
  $('#cards-next').disabled = deck.scrollLeft + deck.clientWidth >= deck.scrollWidth - 1;
}

function updateProgress() {
  const total = countMatches(state);
  $('#match-count').textContent = String(total);
  $('#total-count').textContent = String(totalMatches());
  $('#sidebar-count').textContent = `${total} / ${totalMatches()}`;
  $('#sidebar-progress').style.width = `${total / totalMatches() * 100}%`;
  $('#view-progress').textContent = `${state.view.toUpperCase()} / ${countMatches(state, state.view)} OF ${currentParts().length * 2} MATCHED`;
  for (const button of document.querySelectorAll('[data-view]')) {
    const view = button.dataset.view;
    button.setAttribute('aria-pressed', String(view === state.view));
    button.querySelector('.view-count').textContent = `${countMatches(state, view)}/${allParts().filter(part => part.view === view).length * 2}`;
  }
  for (const button of document.querySelectorAll('[data-target]')) {
    const id = button.dataset.target;
    const part = allParts().find(item => item.id === id);
    const matched = isMatched(id);
    button.classList.toggle('correct', matched);
    button.classList.toggle('named', isMatched(id, 'names'));
    button.classList.toggle('partial', !matched && (isMatched(id, 'names') || isMatched(id, 'functions')));
    button.querySelector('.hotspot-number').textContent = matched ? '✓' : button.dataset.number;
    const knownName = isMatched(id, 'names') ? part.name : `Spot ${button.dataset.number}`;
    button.querySelector('.hotspot-label').textContent = knownName;
    button.setAttribute('aria-label', `Target ${button.dataset.number}${isMatched(id, 'names') ? `: ${part.name}` : ''}${matched ? ', matched' : ''}`);
  }
}

function chooseCard(id) {
  if (!currentParts().some(part => part.id === id) || isMatched(id)) return;
  selected = id;
  document.querySelectorAll('.hotspot.hinted').forEach(button => button.classList.remove('hinted'));
  for (const card of deck.querySelectorAll('[data-card]')) {
    card.classList.toggle('selected', card.dataset.card === id);
    card.setAttribute('aria-pressed', String(card.dataset.card === id));
  }
  const part = allParts().find(item => item.id === id);
  if (state.mode === 'names') showPartNotes(part);
  else $('#part-notes').hidden = true;
  $('#scene-instruction').textContent = state.mode === 'names' ? `${part.name} selected. Choose its numbered spot.` : 'Function selected. Choose the part that does this job.';
}

function attempt(targetId) {
  const target = document.querySelector(`[data-target="${targetId}"]`);
  if (!selected) {
    say(`Spot ${target.dataset.number}. Select a card below, then choose this spot.`);
    return;
  }
  const result = placeCard(state, selected, targetId, state.mode);
  if (!result.correct) {
    say('Try another spot — you’ve got this. Use a hint if you need a nudge.', 'retry');
    target.classList.add('wrong');
    setTimeout(() => target.classList.remove('wrong'), 650);
    return;
  }
  if (result.duplicate) { say('You’ve already matched this one. Try another card.'); return; }
  const part = result.part;
  showPartNotes(part);
  say(`${part.name} — ${part.definition} Nice work!`, 'success');
  selected = null;
  document.querySelectorAll('.hinted,.drop-ready').forEach(button => button.classList.remove('hinted', 'drop-ready'));
  $('#scene-instruction').textContent = 'A little more knowledge on board. Choose your next card.';
  save();
  renderCards();
  updateProgress();
  if (countMatches(state) === totalMatches()) showCompletion();
}

function switchMode(mode) {
  if (!['names', 'functions'].includes(mode)) return;
  state.mode = mode;
  selected = null;
  $('#part-notes').hidden = true;
  document.querySelectorAll('.hinted').forEach(button => button.classList.remove('hinted'));
  $('#scene-instruction').textContent = mode === 'names' ? 'Select a part name, then choose its numbered spot.' : 'Match each short definition to its spot on the aircraft.';
  say(mode === 'names' ? 'Put a name to the parts you see.' : 'What’s its job? Match the definition to the right part.');
  renderCards();
  updateProgress();
  save();
}

function fitWorld() {
  const rect = scene.getBoundingClientRect();
  const mobile = innerWidth <= 580;
  const availableHeight = Math.max(120, rect.height - (mobile ? 100 : 0));
  const width = Math.min(rect.width, availableHeight * 1.5);
  world.style.width = `${width}px`;
  world.style.height = `${width / 1.5}px`;
  requestCamera();
}

function renderCamera() {
  framePending = false;
  const look = cameraEnabled && !reducedMotion.matches;
  const panX = -pointer.x * Math.max(0, (world.clientWidth * zoom - scene.clientWidth) / 2);
  const panY = -pointer.y * Math.max(0, (world.clientHeight * zoom - scene.clientHeight) / 2);
  const tiltX = look ? -pointer.y * 1.2 : 0;
  const tiltY = look ? pointer.x * 1.2 : 0;
  const driftX = look ? -pointer.x * 5 : 0;
  const driftY = look ? -pointer.y * 4 : 0;
  world.style.transform = `perspective(1400px) translate3d(${panX + driftX}px,${panY + driftY}px,0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${zoom})`;
  world.style.setProperty('--inverse-zoom', String(1 / zoom));
  $('#zoom-level').textContent = `${Math.round(zoom * 100)}%`;
  $('#zoom-out').disabled = zoom <= 1;
  $('#zoom-in').disabled = zoom >= 3;
  scene.classList.toggle('zoomed', zoom > 1);
}
function requestCamera() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(renderCamera);
}
function setZoom(value) { zoom = Math.max(1, Math.min(3, Math.round(value * 100) / 100)); requestCamera(); }
function resetCamera() { zoom = 1; pointer = { x: 0, y: 0 }; requestCamera(); }

function switchView(id) {
  const view = availableViews().find(item => item.id === id);
  if (!view) return;
  state.view = id;
  selected = null;
  $('#part-notes').hidden = true;
  $('#scene-title').textContent = view.name;
  $('#view-kicker').textContent = `${String(availableViews().indexOf(view) + 1).padStart(2, '0')} / ${view.subtitle.toUpperCase()}`;
  $('#scene-instruction').textContent = 'Select a card below, then choose its numbered spot.';
  loading.hidden = false;
  loading.textContent = 'Preparing your view…';
  sceneImage.alt = view.alt;
  sceneImage.srcset = `${sceneBase(state.aircraft, id)}-900.webp 900w, ${sceneBase(state.aircraft, id)}-1440.webp 1440w`;
  sceneImage.src = `${sceneBase(state.aircraft, id)}-1440.webp`;
  if (sceneImage.complete && sceneImage.naturalWidth) loading.hidden = true;
  renderMarkers();
  renderCards();
  updateProgress();
  resetCamera();
  fitWorld();
  say(view.description);
  save();
}

function openDialog(html) {
  if (dialog.open) dialog.close();
  $('#dialog-content').innerHTML = html;
  dialog.showModal();
}
function showCompletion() {
  openDialog(`<div class="achievement" aria-hidden="true">✦</div><p class="micro">ALL KNOWLEDGE ON BOARD</p><h2 id="dialog-title">Cleared for takeoff!</h2><p>You explored every corner, named every part and matched every purpose. That’s an aircraft’s worth of discovery.</p><div class="completion-stats"><div><strong>${allParts().length}</strong><span>parts discovered</span></div><div><strong>${totalMatches()}</strong><span>matches made</span></div><div><strong>${availableViews().length}</strong><span>views explored</span></div></div><p>Curiosity looks good on you. Take another look around, or start a fresh flight.</p><div class="dialog-actions"><button class="dialog-button primary" data-dialog-action="close">Keep exploring</button><button class="dialog-button" data-dialog-action="reset">Start a fresh flight</button></div>`);
}
function showHelp() {
  openDialog(`<p class="micro">WELCOME TO YOUR AIRCRAFT LAB</p><h2 id="dialog-title">A little curiosity is all you need.</h2><ol><li><strong>Pick a view.</strong> Explore the exterior, cockpit, passenger cabin or tail. Switch whenever you like.</li><li><strong>Choose your round.</strong> Match part names first, then switch to “What they do” to match definitions.</li><li><strong>Make a match.</strong> Drag a card onto its numbered marker, or select the card and then select the marker. Keyboard users can use Tab and Enter.</li><li><strong>Look closer.</strong> Scroll over the aircraft to zoom, or use + and −. At higher zoom, move your pointer toward an edge to look that way. Use ⤢ to reset.</li><li><strong>Keep discovering.</strong> Hints are free. Wrong guesses never cost points. Progress saves on this device when storage is available.</li></ol><p>The scenes are AI-generated, with gentle photo-based camera motion. This is an identification game, not a flight simulator.</p><div class="dialog-actions"><button class="dialog-button primary" data-dialog-action="close">Let’s explore →</button></div>`);
}
function showGuide() {
  const sections = availableViews().map(view => `<h3>${view.name}</h3>${allParts().filter(part => part.view === view.id).map(part => `<div class="guide-part"><strong>${part.name}</strong><p>${part.definition}</p></div>`).join('')}`).join('');
  openDialog(`<p class="micro">A LITTLE KNOW-HOW</p><h2 id="dialog-title">Your aircraft field guide.</h2><p>A quick reference for every part and purpose. There’s no penalty for looking things up.</p>${sections}<a class="guide-source" href="${SOURCE_URL}" target="_blank" rel="noopener noreferrer">Further learning: FAA aviation handbooks ↗</a><p>Images are illustrative AI-generated aircraft scenes. Labels identify approximate regions; actual aircraft designs vary.</p>`);
}
function confirmReset() {
  openDialog(`<p class="micro">A FRESH START</p><h2 id="dialog-title">Ready for another flight?</h2><p>This clears your ${totalMatches()}-match progress for ${getAircraft(state.aircraft).name} only. You can keep exploring with your current progress instead.</p><div class="dialog-actions"><button class="dialog-button" data-dialog-action="close">Keep my progress</button><button class="dialog-button primary" data-dialog-action="reset">Start fresh</button></div>`);
}

$('#view-buttons').addEventListener('click', event => { const button = event.target.closest('[data-view]'); if (button) switchView(button.dataset.view); });
$('#aircraft-buttons').addEventListener('click', event => { const button = event.target.closest('[data-aircraft]'); if (button) switchAircraft(button.dataset.aircraft); });
$('#mobile-aircraft').addEventListener('change', event => switchAircraft(event.target.value));
$('#close-part-notes').addEventListener('click', () => { $('#part-notes').hidden = true; });
$('#cards-back').addEventListener('click', () => deck.scrollBy({ left: -deck.clientWidth * 0.75, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
$('#cards-next').addEventListener('click', () => deck.scrollBy({ left: deck.clientWidth * 0.75, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
deck.addEventListener('scroll', updateDeckControls, { passive: true });
addEventListener('resize', updateDeckControls, { passive: true });
document.querySelector('.tray-mode').addEventListener('click', event => { const button = event.target.closest('[data-mode]'); if (button) switchMode(button.dataset.mode); });
document.querySelector('.tray-mode').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  switchMode(event.key === 'Home' ? 'names' : event.key === 'End' ? 'functions' : state.mode === 'names' ? 'functions' : 'names');
  $(`#${state.mode}-tab`).focus();
});
deck.addEventListener('click', event => {
  const card = event.target.closest('[data-card]');
  if (!card) return;
  chooseCard(card.dataset.card);
  if (event.detail === 0) document.querySelector('.hotspot:not(.correct)')?.focus({ preventScroll: true });
});
deck.addEventListener('pointerdown', event => {
  const card = event.target.closest('[data-card]');
  if (!card || event.button !== 0) return;
  cardDrag = { id: card.dataset.card, aircraft: state.aircraft, mode: state.mode, view: state.view, x: event.clientX, y: event.clientY, pointerId: event.pointerId, card };
  card.setPointerCapture(event.pointerId);
});
deck.addEventListener('pointermove', event => {
  if (!cardDrag || event.pointerId !== cardDrag.pointerId) return;
  if (!dragging && Math.hypot(event.clientX - cardDrag.x, event.clientY - cardDrag.y) < 6) return;
  if (!dragging) {
    dragging = true;
    chooseCard(cardDrag.id);
    dragGhost = cardDrag.card.cloneNode(true);
    dragGhost.classList.add('drag-ghost');
    dragGhost.removeAttribute('data-card');
    dragGhost.removeAttribute('aria-pressed');
    dragGhost.setAttribute('aria-hidden', 'true');
    document.body.append(dragGhost);
  }
  dragGhost.style.left = `${event.clientX}px`;
  dragGhost.style.top = `${event.clientY}px`;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-target]');
  document.querySelectorAll('.drop-ready').forEach(button => button.classList.toggle('drop-ready', button === target));
  if (target) target.classList.add('drop-ready');
});
function endCardDrag(event, canceled = false) {
  if (!cardDrag || event.pointerId !== cardDrag.pointerId) return;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-target]');
  const valid = dragging && !canceled && cardDrag.aircraft === state.aircraft && cardDrag.mode === state.mode && cardDrag.view === state.view;
  if (valid && target) { selected = cardDrag.id; attempt(target.dataset.target); }
  dragGhost?.remove();
  dragGhost = null;
  cardDrag = null;
  dragging = false;
  document.querySelectorAll('.drop-ready').forEach(button => button.classList.remove('drop-ready'));
}
deck.addEventListener('pointerup', endCardDrag);
deck.addEventListener('pointercancel', event => endCardDrag(event, true));
deck.addEventListener('dragstart', event => event.preventDefault());
$('#hotspots').addEventListener('click', event => { const target = event.target.closest('[data-target]'); if (target) attempt(target.dataset.target); });
$('#hint-button').addEventListener('click', () => {
  const part = allParts().find(item => item.id === selected) || currentParts().find(item => !isMatched(item.id));
  if (!part) { say('This round is complete. Try the other round or switch views!'); return; }
  chooseCard(part.id);
  document.querySelector(`[data-target="${part.id}"]`).classList.add('hinted');
  say(`A little nudge: ${part.hint}`);
  document.querySelector(`[data-card="${part.id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
});
$('#zoom-in').addEventListener('click', () => setZoom(zoom + 0.25));
$('#zoom-out').addEventListener('click', () => setZoom(zoom - 0.25));
$('#reset-camera').addEventListener('click', resetCamera);
cameraToggle.setAttribute('aria-pressed', String(cameraEnabled));
cameraToggle.addEventListener('click', () => {
  if (reducedMotion.matches) { say('Camera motion is off to respect your reduced-motion setting. Zoom still works.'); return; }
  cameraEnabled = !cameraEnabled;
  cameraToggle.setAttribute('aria-pressed', String(cameraEnabled));
  requestCamera();
});
const onMotionChange = () => {
  cameraEnabled = !reducedMotion.matches && !navigator.connection?.saveData;
  cameraToggle.setAttribute('aria-pressed', String(cameraEnabled));
  requestCamera();
};
if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionChange);
else reducedMotion.addListener(onMotionChange);
scene.addEventListener('wheel', event => {
  if (event.target.closest('.view-switcher,.camera-tools') || event.ctrlKey) return;
  event.preventDefault();
  setZoom(zoom - Math.max(-0.15, Math.min(0.15, event.deltaY * 0.0015)));
}, { passive: false });
scene.addEventListener('pointermove', event => {
  if (dragging || event.pointerType !== 'mouse' || event.target.closest('.view-switcher,.camera-tools')) return;
  const rect = scene.getBoundingClientRect();
  pointer = { x: Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2)), y: Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2)) };
  requestCamera();
}, { passive: true });
// Touch and keyboard users can move around a zoomed scene without hover.
scene.addEventListener('keydown', event => {
  const moves = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] };
  if (zoom <= 1 || !moves[event.key] || event.target.closest('.view-switcher,.camera-tools')) return;
  event.preventDefault();
  pointer.x = Math.max(-1, Math.min(1, pointer.x + moves[event.key][0]));
  pointer.y = Math.max(-1, Math.min(1, pointer.y + moves[event.key][1]));
  requestCamera();
});
let touchStart = null;
scene.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'touch' || zoom <= 1 || event.target.closest('button')) return;
  touchStart = { x: event.clientX, y: event.clientY, panX: pointer.x, panY: pointer.y };
  scene.setPointerCapture(event.pointerId);
});
scene.addEventListener('pointermove', event => {
  if (!touchStart || event.pointerType !== 'touch') return;
  pointer.x = Math.max(-1, Math.min(1, touchStart.panX - (event.clientX - touchStart.x) / 100));
  pointer.y = Math.max(-1, Math.min(1, touchStart.panY - (event.clientY - touchStart.y) / 100));
  requestCamera();
});
scene.addEventListener('pointerup', () => { touchStart = null; });
scene.addEventListener('pointercancel', () => { touchStart = null; });
$('#sidebar-toggle').addEventListener('click', () => {
  const collapsed = document.body.classList.toggle('sidebar-collapsed');
  $('#sidebar-toggle').setAttribute('aria-expanded', String(!collapsed));
  $('#sidebar-toggle').setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
  $('#sidebar-toggle').firstElementChild.textContent = collapsed ? '›' : '‹';
});
$('#guide-button').addEventListener('click', showGuide);
$('#help-button').addEventListener('click', showHelp);
$('#restart-button').addEventListener('click', confirmReset);
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const action = event.target.closest('[data-dialog-action]')?.dataset.dialogAction;
  if (action === 'close') dialog.close();
  if (action === 'reset') {
    state = createState(state.aircraft);
    selected = null;
    fleet.progress[state.aircraft] = state;
    orders.clear();
    dialog.close();
    switchView('exterior');
  }
});
sceneImage.addEventListener('load', () => { loading.hidden = true; fitWorld(); });
sceneImage.addEventListener('error', () => { loading.hidden = false; loading.textContent = 'This scene could not load. Choose another view and try again.'; });
if ('ResizeObserver' in window) { resizeObserver = new ResizeObserver(fitWorld); resizeObserver.observe(scene); }
else addEventListener('resize', fitWorld, { passive: true });
renderAircraftPicker();
viewButtons();
switchView(state.view);
