import { DEPARTURE_DURATION as duration, DEPARTURE_SOURCE, departureSteps, departureIndex } from './departure.mjs';
import { sceneBase } from './fleet.mjs';

export function takeoffMarkup(plane) {
  const steps = departureSteps(plane.id);
  return `<section class="takeoff" data-stage="loading" data-aircraft="${plane.id}" aria-label="${plane.name} takeoff celebration">
    <div class="takeoff-scene" aria-hidden="true">
      <div class="takeoff-cloud cloud-one"></div><div class="takeoff-cloud cloud-two"></div>
      <div class="takeoff-horizon"></div><div class="takeoff-runway"><div class="runway-markings"></div></div>
      <div class="takeoff-shadow"></div>
      <div class="takeoff-airframe"><img class="takeoff-plane" src="/assets/game/takeoff/${plane.id}.webp" alt="" draggable="false"><img class="takeoff-gear-up" src="/assets/game/takeoff/${plane.id}-gear-up.webp" alt="" draggable="false"></div>
      <span class="takeoff-aircraft-name">${plane.name}</span>
    </div>
    <div class="takeoff-systems" aria-label="Aircraft configuration"><span class="system-controls">Controls: checking</span><span class="system-flaps">Flaps: not set</span><span class="system-gear">Gear: down</span></div>
    <div class="takeoff-caption"><div><strong class="takeoff-status" role="status" aria-live="polite">Preparing your aircraft…</strong></div><div class="takeoff-actions"><button type="button" class="takeoff-pause">Pause</button><button type="button" class="takeoff-skip">Skip animation</button></div></div>
    <div class="takeoff-lesson"><img class="takeoff-closeup" alt="" width="100" height="68"><p class="takeoff-detail">Every part matched. Every system ready.</p></div>
    <ol class="takeoff-checklist" aria-label="Departure sequence">${steps.map(step => `<li>${step.label}</li>`).join('')}</ol>
    <details class="takeoff-explained"><summary>Read the takeoff steps</summary><ol>${steps.map(step=>`<li><strong>${step.title}</strong><p>${step.detail}</p></li>`).join('')}</ol><p>A simplified sequence: settings and timing vary by aircraft. <a href="${DEPARTURE_SOURCE}" target="_blank" rel="noopener noreferrer">Explore the FAA flying handbook ↗</a></p></details>
    <button type="button" class="takeoff-replay" hidden>Replay takeoff ↗</button>
  </section>`;
}

export function mountTakeoff(root) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const plane = root.querySelector('.takeoff-plane');
  const airframe = root.querySelector('.takeoff-airframe');
  const gearUp = root.querySelector('.takeoff-gear-up');
  const pause = root.querySelector('.takeoff-pause');
  const skip = root.querySelector('.takeoff-skip');
  const replay = root.querySelector('.takeoff-replay');
  const stages = departureSteps(root.dataset.aircraft);
  let paused = false;
  let gearArtReady = false;
  let animations = [];
  let clock;
  let stopped = false;
  let ready = false;

  function setStage(index) {
    const {id: stage, title, detail, view} = stages[index];
    if (root.dataset.stage === stage) return;
    root.dataset.stage = stage;
    root.querySelector('.takeoff-status').textContent = title;
    root.querySelector('.takeoff-detail').textContent = detail;
    root.querySelector('.system-controls').textContent = index === 0 ? 'Controls: checking' : 'Controls: checked';
    root.querySelector('.system-flaps').textContent = index < 1 ? 'Flaps: not set' : index < 8 ? 'Flaps: takeoff set' : 'Flaps: climb configuration';
    root.querySelector('.system-gear').textContent = index < 7 ? 'Gear: down' : index === 7 ? 'Gear: retracting' : 'Gear: up';
    const photo = root.querySelector('.takeoff-closeup');
    const src = `${sceneBase(root.dataset.aircraft, view)}-900.webp`;
    if (photo.getAttribute('src') !== src) photo.src = src;
    root.querySelectorAll('.takeoff-checklist li').forEach((item, i) => {
      item.classList.toggle('done', i <= index);
      if (i === index) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
  }
  function cancelAnimations() {
    clearInterval(clock);
    for (const animation of animations) { animation.onfinish = null; animation.cancel(); }
    animations = [];
  }
  function finish() {
    const skipped = document.activeElement === skip;
    cancelAnimations();
    setStage(stages.length - 1);
    pause.hidden = true;
    skip.hidden = true;
    replay.hidden = motion.matches || !ready;
    if (skipped && !replay.hidden) replay.focus({preventScroll:true});
  }
  function start() {
    if (stopped || !ready) return;
    cancelAnimations();
    if (motion.matches || !plane.animate) { finish(); return; }
    setStage(0);
    paused = false;
    pause.hidden = false;
    pause.textContent = 'Pause';
    skip.hidden = false;
    replay.hidden = true;
    const animate = (element, frames) => {
      const animation = element.animate(frames, {duration, fill:'forwards', easing:'linear'});
      animations.push(animation);
      return animation;
    };
    const flight = animate(airframe, [
      {offset:0, transform:'translate(0,0) rotate(0deg)'},
      {offset:.4, transform:'translate(0,0) rotate(0deg)', easing:'ease-in'},
      {offset:.5333, transform:'translate(25%,0) rotate(0deg)'},
      {offset:.6333, transform:'translate(35%,-20%) rotate(-9deg)'},
      {offset:1, transform:'translate(35%,-55%) rotate(-9deg)'},
    ]);
    if (gearArtReady) {
      animate(plane, [{offset:0,opacity:1},{offset:.7333,opacity:1},{offset:.8,opacity:0},{offset:1,opacity:0}]);
      animate(gearUp, [{offset:0,opacity:0},{offset:.7333,opacity:0},{offset:.8,opacity:1},{offset:1,opacity:1}]);
    }
    animate(root.querySelector('.runway-markings'), [
      {offset:0, transform:'translateX(0)'}, {offset:.4, transform:'translateX(0)', easing:'ease-in'},
      {offset:.5333, transform:'translateX(-30%)'}, {offset:1, transform:'translateX(-70%)'},
    ]);
    animate(root.querySelector('.takeoff-shadow'), [
      {offset:0, opacity:.25}, {offset:.5333, opacity:.25}, {offset:.7, opacity:0}, {offset:1, opacity:0},
    ]);
    for (const cloud of root.querySelectorAll('.takeoff-cloud')) animate(cloud, [{transform:'translateX(0)'},{transform:'translateX(-35%)'}]);
    flight.onfinish = finish;
    clock = setInterval(() => {
      const time = Number(flight.currentTime) || 0;
      setStage(departureIndex(stages, time));
    }, 150);
    onVisibility();
  }
  function onVisibility() {
    for (const animation of animations) (document.hidden || paused) ? animation.pause() : animation.play();
  }
  function onMotionChange() { if (motion.matches) finish(); else replay.hidden = !ready; }
  function togglePause() { paused = !paused; pause.textContent = paused ? 'Resume' : 'Pause'; onVisibility(); }
  pause.addEventListener('click', togglePause);
  skip.addEventListener('click', finish);
  replay.addEventListener('click', start);
  motion.addEventListener('change', onMotionChange);
  document.addEventListener('visibilitychange', onVisibility);
  const gearLoaded = gearUp.decode().then(() => { gearArtReady = true; root.dataset.gearArt = 'ready'; }).catch(() => { gearUp.hidden = true; });
  Promise.all([plane.decode(), gearLoaded]).then(() => { if (!stopped) { ready = true; start(); } }).catch(() => {
    if (stopped) return;
    plane.hidden = true;
    finish();
    root.querySelector('.takeoff-detail').textContent = 'Your flight is ready. The aircraft image could not load this time.';
  });
  return () => {
    stopped = true;
    cancelAnimations();
    pause.removeEventListener('click', togglePause);
    skip.removeEventListener('click', finish);
    replay.removeEventListener('click', start);
    motion.removeEventListener('change', onMotionChange);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
