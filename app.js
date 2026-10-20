const root = document.documentElement;
const toggle = document.querySelector('[data-motion-toggle]');
const hero = document.querySelector('[data-hero-plane]');
const plane = document.querySelector('[data-flight-plane]');
const journey = document.querySelector('[data-journey]');
const progressBar = document.querySelector('[data-flight-progress]');
const stageNumber = document.querySelector('[data-stage-number]');
const stageLabel = document.querySelector('[data-stage-label]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const labels = ['GET TO KNOW YOUR PLANE', 'A NAME FOR EVERY PART', 'KNOWLEDGE, READY FOR TAKEOFF'];
let savedPreference = null;
try { savedPreference = localStorage.getItem('pbs67-motion'); } catch { /* Storage may be unavailable in private contexts. */ }
let motionEnabled = !reducedMotion.matches && !navigator.connection?.saveData && savedPreference !== 'off';
let framePending = false;
let currentStage = -1;

function renderScroll() {
  framePending = false;
  if (document.hidden) return;
  const rect = journey.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, (innerHeight * 0.45 - rect.top) / rect.height));
  const stage = Math.min(2, Math.floor(progress * 3));
  if (currentStage !== stage) {
    currentStage = stage;
    stageNumber.textContent = String(stage + 1).padStart(2, '0');
    stageLabel.textContent = labels[stage];
  }
  progressBar.style.transform = `scaleX(${Math.max(0.03, progress)})`;
  if (!motionEnabled || reducedMotion.matches) return;
  // Only update visible scenes; one frame is scheduled per scroll/resize, never an idle loop.
  if (rect.bottom > 0 && rect.top < innerHeight) {
    const mobile = innerWidth <= 760;
    const x = Math.sin(progress * Math.PI * 1.5) * (mobile ? 13 : 28);
    const y = (mobile ? 20 : 52) - progress * (mobile ? 50 : 130);
    const bank = -10 + progress * 16;
    const scale = 0.86 + Math.sin(progress * Math.PI) * 0.14;
    plane.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${bank}deg) scale(${scale})`;
  }
  if (scrollY < innerHeight * 1.5) {
    hero.style.transform = `translate3d(0, ${Math.min(scrollY * 0.12, 95)}px, 0) scale(1.025)`;
  }
}

function scheduleRender() {
  if (framePending || document.hidden) return;
  framePending = true;
  requestAnimationFrame(renderScroll);
}

function applyMotionPreference() {
  const active = motionEnabled && !reducedMotion.matches;
  root.classList.toggle('motion-off', !active);
  toggle.setAttribute('aria-pressed', String(active));
  toggle.setAttribute('aria-label', active ? 'Turn animations off' : 'Turn animations on');
  toggle.querySelector('[data-motion-label]').textContent = active ? 'Motion on' : 'Motion off';
  toggle.disabled = reducedMotion.matches;
  if (reducedMotion.matches) {
    toggle.setAttribute('aria-label', 'Animations off: system reduced motion enabled');
    toggle.querySelector('[data-motion-label]').textContent = 'Reduced motion';
  }
  toggle.querySelector('.motion-icon').textContent = active ? 'Ⅱ' : '▷';
  if (!active) { plane.style.transform = ''; hero.style.transform = ''; }
  scheduleRender();
}

toggle.hidden = false;
toggle.addEventListener('click', () => {
  motionEnabled = !motionEnabled;
  savedPreference = motionEnabled ? 'on' : 'off';
  try { localStorage.setItem('pbs67-motion', savedPreference); } catch { /* Keep the current-session preference. */ }
  applyMotionPreference();
});
const onReducedMotionChange = () => {
  motionEnabled = !reducedMotion.matches && savedPreference !== 'off' && !navigator.connection?.saveData;
  applyMotionPreference();
};
if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onReducedMotionChange);
else reducedMotion.addListener(onReducedMotionChange);
addEventListener('scroll', scheduleRender, { passive: true });
addEventListener('resize', scheduleRender, { passive: true });
document.addEventListener('visibilitychange', scheduleRender);
applyMotionPreference();
