const duration = 9400;

export function takeoffMarkup(plane) {
  return `<section class="takeoff" data-stage="loading" aria-label="${plane.name} takeoff celebration">
    <div class="takeoff-scene" aria-hidden="true">
      <div class="takeoff-cloud cloud-one"></div><div class="takeoff-cloud cloud-two"></div>
      <div class="takeoff-horizon"></div><div class="takeoff-runway"><div class="runway-markings"></div></div>
      <div class="takeoff-shadow"></div>
      <img class="takeoff-plane" src="/assets/game/takeoff/${plane.id}.webp" alt="" draggable="false">
      <span class="takeoff-aircraft-name">${plane.name}</span>
    </div>
    <div class="takeoff-caption"><div><strong class="takeoff-status" role="status" aria-live="polite">Preparing your aircraft…</strong><p class="takeoff-detail">Every part matched. Every system ready.</p></div><button type="button" class="takeoff-skip">Skip animation</button></div>
    <ol class="takeoff-checklist" aria-label="Departure sequence"><li>Prepare</li><li>Accelerate</li><li>Lift off</li><li>Airborne</li></ol>
    <button type="button" class="takeoff-replay" hidden>Replay takeoff ↗</button>
  </section>`;
}

export function mountTakeoff(root) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const plane = root.querySelector('.takeoff-plane');
  const skip = root.querySelector('.takeoff-skip');
  const replay = root.querySelector('.takeoff-replay');
  const stages = [
    ['preparing', 'Preparing for departure', 'Controls checked. Cabin secure. Ready to roll.'],
    ['rolling', 'Accelerating down the runway', 'Thrust set. Building speed for takeoff.'],
    ['rotating', 'Lift off!', 'The nose rises and the wings carry your aircraft into the sky.'],
    ['airborne', 'You’re airborne!', 'Every part and purpose mastered. Enjoy the view.'],
  ];
  let animations = [];
  let clock;
  let stopped = false;
  let ready = false;

  function setStage(index) {
    const [stage, title, detail] = stages[index];
    if (root.dataset.stage === stage) return;
    root.dataset.stage = stage;
    root.querySelector('.takeoff-status').textContent = title;
    root.querySelector('.takeoff-detail').textContent = detail;
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
    setStage(3);
    skip.hidden = true;
    replay.hidden = motion.matches || !ready;
    if (skipped && !replay.hidden) replay.focus({preventScroll:true});
  }
  function start() {
    if (stopped || !ready) return;
    cancelAnimations();
    if (motion.matches || !plane.animate) { finish(); return; }
    setStage(0);
    skip.hidden = false;
    replay.hidden = true;
    const animate = (element, frames) => {
      const animation = element.animate(frames, {duration, fill:'forwards', easing:'linear'});
      animations.push(animation);
      return animation;
    };
    const flight = animate(plane, [
      {offset:0, transform:'translate(0,0) rotate(0deg)'},
      {offset:.22, transform:'translate(0,0) rotate(0deg)'},
      {offset:.59, transform:'translate(25%,0) rotate(0deg)', easing:'ease-in'},
      {offset:.72, transform:'translate(35%,-25%) rotate(-9deg)'},
      {offset:1, transform:'translate(35%,-55%) rotate(-9deg)'},
    ]);
    animate(root.querySelector('.runway-markings'), [
      {offset:0, transform:'translateX(0)'}, {offset:.22, transform:'translateX(0)', easing:'ease-in'},
      {offset:.59, transform:'translateX(-30%)'}, {offset:1, transform:'translateX(-70%)'},
    ]);
    animate(root.querySelector('.takeoff-shadow'), [
      {offset:0, opacity:.25, transform:'scaleX(1)'}, {offset:.59, opacity:.25, transform:'scaleX(1)'},
      {offset:.8, opacity:0, transform:'scaleX(.5)'}, {offset:1, opacity:0, transform:'scaleX(.2)'},
    ]);
    for (const cloud of root.querySelectorAll('.takeoff-cloud')) animate(cloud, [{transform:'translateX(0)'},{transform:'translateX(-35%)'}]);
    flight.onfinish = finish;
    clock = setInterval(() => {
      const time = Number(flight.currentTime) || 0;
      setStage(time < 2100 ? 0 : time < 5550 ? 1 : 2);
    }, 150);
    onVisibility();
  }
  function onVisibility() {
    for (const animation of animations) document.hidden ? animation.pause() : animation.play();
  }
  function onMotionChange() { if (motion.matches) finish(); else replay.hidden = !ready; }
  skip.addEventListener('click', finish);
  replay.addEventListener('click', start);
  motion.addEventListener('change', onMotionChange);
  document.addEventListener('visibilitychange', onVisibility);
  plane.decode().then(() => { if (!stopped) { ready = true; start(); } }).catch(() => {
    if (stopped) return;
    plane.hidden = true;
    finish();
    root.querySelector('.takeoff-detail').textContent = 'Your flight is ready. The aircraft image could not load this time.';
  });
  return () => {
    stopped = true;
    cancelAnimations();
    skip.removeEventListener('click', finish);
    replay.removeEventListener('click', start);
    motion.removeEventListener('change', onMotionChange);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
