import './style.css';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- reveal on scroll ---------- */
function initReveal() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window) || reducedMotion.matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));
}

/* ---------- falling petals (CSS-animated, ≤ 18) ---------- */
function initPetals() {
  const host = $('.petals');
  if (!host || reducedMotion.matches) return;
  const count = window.innerWidth < 380 ? 14 : 18;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    const dur = 9 + Math.random() * 8;
    p.style.cssText = [
      `--x:${Math.round(Math.random() * 96)}%`,
      `--w:${(8 + Math.random() * 8).toFixed(1)}px`,
      `--dur:${dur.toFixed(1)}s`,
      `--delay:${(-Math.random() * dur).toFixed(1)}s`,
      `--sway:${Math.round(20 + Math.random() * 40) * (Math.random() < 0.5 ? -1 : 1)}px`,
    ].join(';');
    frag.appendChild(p);
  }
  host.appendChild(frag);
}

/* ---------- twinkling stars in the hero sky ---------- */
function initTwinkles() {
  const host = $('.twinkles');
  if (!host) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 16; i++) {
    const t = document.createElement('span');
    t.className = 'twinkle';
    t.style.cssText = [
      `--x:${(3 + Math.random() * 94).toFixed(1)}%`,
      `--y:${(4 + Math.random() * 88).toFixed(1)}%`,
      `--s:${(1.5 + Math.random() * 2).toFixed(1)}px`,
      `--dur:${(1.6 + Math.random() * 2.4).toFixed(1)}s`,
      `--delay:${(-Math.random() * 4).toFixed(1)}s`,
    ].join(';');
    frag.appendChild(t);
  }
  host.appendChild(frag);
}

/* Pause hero animations while the cover is off-screen (saves battery / GPU). */
function initHeroPause() {
  const hero = $('.hero');
  if (!hero || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => hero.classList.toggle('is-paused', !e.isIntersecting)).observe(hero);
}

/* ---------- music ---------- */
async function initMusic() {
  const wrap = $('.music');
  if (!wrap) return;
  const src = wrap.dataset.src;
  try {
    const res = await fetch(src, { method: 'HEAD', cache: 'no-store' });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !/audio|mpeg|octet-stream/i.test(type)) return; // no file yet → stay hidden
  } catch {
    return;
  }

  const btn = $('.music__btn', wrap);
  let audio = null;
  wrap.hidden = false;
  const hideHint = () => wrap.classList.add('hint-gone');
  setTimeout(hideHint, 5000);

  const setState = (playing) => {
    wrap.classList.toggle('is-playing', playing);
    btn.setAttribute('aria-pressed', String(playing));
    btn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
  };

  btn.addEventListener('click', async () => {
    hideHint();
    if (!audio) {
      audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'auto';
      audio.addEventListener('pause', () => setState(false));
      audio.addEventListener('play', () => setState(true));
    }
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setState(false);
      }
    } else {
      audio.pause();
    }
  });

  // Pause when the tab is hidden; don't auto-resume.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && audio && !audio.paused) audio.pause();
  });
}

/* ---------- lightbox ---------- */
function initLightbox() {
  const dlg = $('.lightbox');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const img = $('.lightbox__img', dlg);
  let opener = null;

  $$('.strip__btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      opener = btn;
      img.src = btn.dataset.full;
      img.alt = btn.dataset.alt || '';
      dlg.showModal();
    }),
  );
  const close = () => dlg.close();
  $('.lightbox__close', dlg).addEventListener('click', close);
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) close();
  });
  dlg.addEventListener('close', () => {
    img.removeAttribute('src');
    opener?.focus();
  });
}

/* ---------- countdown ---------- */
function initCountdown() {
  const box = $('.countdown');
  if (!box) return;
  const target = new Date(box.dataset.target).getTime();
  const nums = Object.fromEntries($$('[data-unit]', box).map((el) => [el.dataset.unit, el]));
  const done = $('.countdown__done', box);
  const pad = (n) => String(n).padStart(2, '0');
  let timer = 0;

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      box.classList.add('is-done');
      done.hidden = false;
      clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    nums.days.textContent = Math.floor(s / 86400);
    nums.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    nums.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    nums.seconds.textContent = pad(s % 60);
  };
  tick();
  timer = setInterval(tick, 1000);
}

/* ---------- boot ---------- */
initReveal();
initPetals();
initTwinkles();
initHeroPause();
initLightbox();
initCountdown();
const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
idle(() => initMusic());
