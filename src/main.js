import './style.css';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasIO = 'IntersectionObserver' in window;
let lenis = null;

/* ==========================================================
   Scroll loop: one passive listener, rAF-throttled. Subscribers
   do their reads first, then their writes (no layout thrash).
   ========================================================== */
const scrollSubs = new Set();
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const vh = window.innerHeight;
    const jobs = [...scrollSubs].map((fn) => fn(vh)); // reads
    jobs.forEach((write) => write && write()); // writes
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });

/* ==========================================================
   Reveal system: blur-fade-up, script write-on, image wipe.
   Elements entering together are staggered by 80ms.
   ========================================================== */
function initReveal() {
  const items = $$('.reveal, .reveal-img');
  if (!hasIO || reduced) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  // An element fully hidden by its own clip-path never "intersects", so
  // clip-revealed elements are observed through their parent.
  const proxyOf = new Map();
  const isClipped = (el) => el.classList.contains('reveal-img') || el.classList.contains('reveal--script');
  const io = new IntersectionObserver(
    (entries) => {
      const entering = entries
        .filter((e) => e.isIntersecting)
        .flatMap((e) => {
          io.unobserve(e.target);
          return proxyOf.get(e.target) || [e.target];
        })
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      entering.forEach((el, i) => {
        el.style.setProperty('--d', `${Math.min(i, 6) * 80}ms`);
        el.classList.add('is-animating', 'is-in');
        const done = (ev) => {
          if (ev.target !== el) return;
          el.classList.remove('is-animating');
          el.removeEventListener('transitionend', done);
          el.removeEventListener('animationend', done);
        };
        el.addEventListener('transitionend', done);
        el.addEventListener('animationend', done);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );
  items.forEach((el) => {
    if (!isClipped(el)) return io.observe(el);
    const host = el.parentElement;
    if (!proxyOf.has(host)) {
      proxyOf.set(host, []);
      io.observe(host);
    }
    proxyOf.get(host).push(el);
  });
}

/* ==========================================================
   Opening doors (first visit in this tab)
   ========================================================== */
const audio = { el: null };

function startMusic(fromGesture) {
  const wrap = $('.music');
  if (!wrap) return;
  const src = wrap.dataset.src;
  const btn = $('.music__btn', wrap);

  const setState = (playing) => {
    wrap.classList.toggle('is-playing', playing);
    btn.setAttribute('aria-pressed', String(playing));
    btn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
  };
  const create = () => {
    const a = new Audio(src);
    a.loop = true;
    a.preload = 'auto';
    a.addEventListener('play', () => setState(true));
    a.addEventListener('pause', () => setState(false));
    a.addEventListener('error', () => {
      wrap.hidden = true; // file missing → stay out of the way
    });
    audio.el = a;
    return a;
  };

  if (!btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', async () => {
      wrap.classList.add('hint-gone');
      const a = audio.el || create();
      if (a.paused) {
        try {
          await a.play();
        } catch {
          setState(false);
        }
      } else a.pause();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && audio.el && !audio.el.paused) audio.el.pause();
    });
  }

  if (fromGesture) {
    // The door tap is the user gesture browsers require for audio.
    const a = create();
    a.play()
      .then(() => {
        wrap.hidden = false;
        wrap.classList.add('hint-gone');
      })
      .catch(() => {
        /* missing file or blocked: skip silently */
      });
    return;
  }
  // Returning visitor (doors skipped): show the button only if the file exists.
  fetch(src, { method: 'HEAD', cache: 'no-store' })
    .then((res) => {
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !/audio|mpeg|octet-stream/i.test(type)) return;
      wrap.hidden = false;
      setTimeout(() => wrap.classList.add('hint-gone'), 5000);
    })
    .catch(() => {});
}

function initDoors() {
  const doors = $('.doors');
  const main = $('#top');
  if (!doors || !root.classList.contains('doors-up')) {
    doors?.remove();
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    idle(() => startMusic(false));
    return;
  }
  main.inert = true;
  const btn = $('.doors__open', doors);
  btn.focus({ preventScroll: true });
  btn.addEventListener(
    'click',
    () => {
      startMusic(true);
      try {
        sessionStorage.setItem('tu-doors', '1');
      } catch {
        /* private mode */
      }
      doors.classList.add('is-opening');
      const reveal = reduced ? 250 : 1150; // hero animates in as the doors finish
      const fade = reduced ? 0 : 1350;
      setTimeout(() => {
        root.classList.remove('doors-up');
        main.inert = false;
        lenis?.start();
        onScroll();
      }, reveal);
      setTimeout(() => doors.classList.add('is-gone'), fade);
      setTimeout(() => doors.remove(), fade + 900);
    },
    { once: true },
  );
}

/* ==========================================================
   Hero: petals (≤14 on phones) + pause effects off-screen
   ========================================================== */
function spawnPetals(host, count) {
  if (!host || reduced) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    const dur = 9 + Math.random() * 8;
    p.style.cssText = [
      `--x:${Math.round(Math.random() * 96)}%`,
      `--w:${(8 + Math.random() * 7).toFixed(1)}px`,
      `--dur:${dur.toFixed(1)}s`,
      `--delay:${(-Math.random() * dur).toFixed(1)}s`,
      `--sway:${Math.round(20 + Math.random() * 40) * (Math.random() < 0.5 ? -1 : 1)}px`,
    ].join(';');
    frag.appendChild(p);
  }
  host.appendChild(frag);
}

function initHero() {
  const hero = $('.hero');
  const phone = window.innerWidth <= 480;
  spawnPetals($('.hero .petals'), phone ? 14 : 18);
  spawnPetals($('.petals--closing'), phone ? 8 : 10);
  if (hero && hasIO) {
    new IntersectionObserver(([e]) => hero.classList.toggle('is-paused', !e.isIntersecting)).observe(hero);
  }
}

/* ==========================================================
   Parallax: photos drift ±N px inside their frames
   ========================================================== */
function initParallax() {
  if (reduced || !hasIO) return;
  const items = $$('[data-parallax]');
  const visible = new Set();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      onScroll();
    },
    { rootMargin: '10% 0px' },
  );
  items.forEach((el) => io.observe(el));
  scrollSubs.add((vh) => {
    const reads = [...visible].map((el) => {
      const r = el.parentElement.getBoundingClientRect();
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1 … 1
      return [el, Math.max(-1, Math.min(1, p)) * -Number(el.dataset.parallax)];
    });
    return () => reads.forEach(([el, y]) => (el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`));
  });
}

/* ==========================================================
   Events timeline: the gold line draws itself as you scroll
   ========================================================== */
function initTimeline() {
  const tl = $('.timeline');
  if (!tl) return;
  const line = $('.timeline__line', tl);
  const rail = $('.timeline__rail', tl);
  const nodes = $$('.timeline__node', tl);
  if (reduced || !hasIO) {
    line.style.transform = 'none';
    nodes.forEach((n) => n.classList.add('is-lit'));
    return;
  }
  let active = false;
  new IntersectionObserver(([e]) => {
    active = e.isIntersecting;
    onScroll();
  }).observe(tl);
  scrollSubs.add((vh) => {
    if (!active) return null;
    const r = rail.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (vh * 0.68 - r.top) / r.height));
    const lit = nodes.map((n) => n.getBoundingClientRect().top < vh * 0.68);
    return () => {
      line.style.transform = `scaleY(${p.toFixed(4)})`;
      nodes.forEach((n, i) => n.classList.toggle('is-lit', lit[i]));
    };
  });
}

/* ==========================================================
   Couple carousel: centred slide, dots, 4s auto-advance
   ========================================================== */
function initCarousel() {
  const box = $('[data-carousel]');
  if (!box) return;
  const track = $('.carousel__track', box);
  const slides = $$('.carousel__slide', box);
  const dots = $$('.carousel__dot', box);
  let index = 0;
  let pausedUntil = 0;
  let inView = false;

  const goTo = (i) => {
    const s = slides[i];
    track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
  };
  const setActive = (i) => {
    index = i;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    dots.forEach((d, k) => (k === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
  };
  setActive(0);

  if (hasIO) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) setActive(slides.indexOf(e.target));
        });
      },
      { root: track, threshold: [0.6] },
    );
    slides.forEach((s) => io.observe(s));
    new IntersectionObserver(([e]) => (inView = e.isIntersecting)).observe(box);
  }

  const hold = () => (pausedUntil = Date.now() + 8000);
  ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach((ev) => track.addEventListener(ev, hold, { passive: true }));
  dots.forEach((d, i) =>
    d.addEventListener('click', () => {
      hold();
      goTo(i);
    }),
  );

  if (!reduced && slides.length > 1) {
    setInterval(() => {
      if (!inView || Date.now() < pausedUntil || document.hidden || $('.lightbox[open]')) return;
      goTo((index + 1) % slides.length);
    }, 4000);
  }

  // tapping a side slide centres it; tapping the centred one opens the lightbox
  $$('.carousel__btn', box).forEach((btn, i) =>
    btn.addEventListener('click', (e) => {
      if (i !== index) {
        e.stopImmediatePropagation();
        hold();
        goTo(i);
      }
    }),
  );
}

/* ---------- lightbox (pinch-zoom allowed) ---------- */
function initLightbox() {
  const dlg = $('.lightbox');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const img = $('.lightbox__img', dlg);
  let opener = null;
  $$('.carousel__btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      opener = btn;
      img.src = btn.dataset.full;
      img.alt = btn.dataset.alt || '';
      dlg.showModal();
    }),
  );
  $('.lightbox__close', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });
  dlg.addEventListener('close', () => {
    img.removeAttribute('src');
    opener?.focus();
  });
}

/* ==========================================================
   Countdown with sliding digits (only tiles that change move)
   ========================================================== */
function initCountdown() {
  const box = $('.countdown');
  if (!box) return;
  const target = new Date(box.dataset.target).getTime();
  const nums = Object.fromEntries($$('[data-unit]', box).map((el) => [el.dataset.unit, el]));
  const done = $('.countdown__done', box);
  const pad = (n) => String(n).padStart(2, '0');
  let visible = false;
  let timer = 0;
  if (hasIO) new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(box);

  const set = (el, val) => {
    if (el.dataset.v === val) return;
    const first = el.dataset.v === undefined;
    el.dataset.v = val;
    const old = el.querySelector('.tile__digit:not(.is-leave)');
    if (first || !visible || reduced) {
      el.querySelectorAll('.tile__digit').forEach((d, i) => i && d.remove());
      if (old) old.textContent = val;
      return;
    }
    const next = document.createElement('span');
    next.className = 'tile__digit is-enter';
    next.textContent = val;
    el.appendChild(next);
    next.getBoundingClientRect(); // commit the start position
    next.classList.remove('is-enter');
    if (old) {
      old.classList.add('is-leave');
      setTimeout(() => old.remove(), 650);
    }
  };

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      box.classList.add('is-done');
      done.hidden = false;
      clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    set(nums.days, String(Math.floor(s / 86400)));
    set(nums.hours, pad(Math.floor((s % 86400) / 3600)));
    set(nums.minutes, pad(Math.floor((s % 3600) / 60)));
    set(nums.seconds, pad(s % 60));
  };
  tick();
  timer = setInterval(tick, 1000);
}

/* ---------- smooth wheel scrolling on desktop only ---------- */
function initLenis() {
  if (reduced || !window.matchMedia('(pointer: fine) and (hover: hover)').matches) return;
  import('lenis').then(({ default: Lenis }) => {
    lenis = new Lenis({ smoothWheel: true, syncTouch: false, anchors: true, lerp: 0.1 });
    if (root.classList.contains('doors-up')) lenis.stop();
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  });
}

/* ---------- remind the family about unfilled placeholders ---------- */
function warnPlaceholders() {
  const ph = $('#rsvp')?.dataset.placeholders;
  if (ph) console.warn(`[invitation] Placeholder RSVP details still need filling in (src/content.js): ${ph}`);
}

/* ---------- boot ---------- */
initDoors();
initReveal();
initHero();
initParallax();
initTimeline();
initCarousel();
initLightbox();
initCountdown();
initLenis();
warnPlaceholders();
onScroll();
