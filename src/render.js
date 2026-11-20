/**
 * Renders the invitation markup from src/content.js.
 * Runs at build time (and on every dev request) via the Vite plugin in
 * vite.config.js, so the page ships as fully rendered static HTML.
 * Pure functions only — no DOM access.
 */
import { archPath, ARCH_TOP } from './lib/arch.js';
import { sprite, use, divider } from './lib/ornaments.js';
import { doorSymbol, doorFrame, doorLeaf } from './lib/doors.js';
import { images } from './generated/images.js';

/* ---------- helpers ---------- */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
const lines = (arr) => arr.map(esc).join('<br>');
/** Keep each person's name on one line: wrap only at ", " and " & ". */
const names = (str) =>
  String(str)
    .split(/(, | & )/)
    .map((part) => (/^(, | & )$/.test(part) ? esc(part) : `<span class="nw">${esc(part)}</span>`))
    .join('');
export const isPlaceholder = (s) => !s || /PLACEHOLDER|X{4,}|^NAME_\d+$/i.test(String(s));
const telHref = (p) => `tel:${String(p).replace(/[^\d+]/g, '')}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ---------- responsive images (from src/generated/images.js) ---------- */
function variants(key) {
  const v = images[key];
  if (!v) throw new Error(`Unknown image "${key}". Add it to assets/images and run: npm run generate:assets`);
  return v;
}
const pick = (key, min) => {
  const v = variants(key);
  return v.find((x) => x.w >= min) || v[v.length - 1];
};
/**
 * <img> with srcset/sizes and intrinsic width/height (prevents layout shift).
 * Everything is lazy unless eager=true.
 */
function img(key, { alt = '', sizes = '100vw', cls = '', eager = false, attrs = '' } = {}) {
  const v = variants(key);
  const def = pick(key, 1000);
  const loading = eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
  return `<img${cls ? ` class="${cls}"` : ''} src="${def.src}" srcset="${v.map((x) => `${x.src} ${x.w}w`).join(', ')}" sizes="${esc(sizes)}" width="${def.w}" height="${def.h}" alt="${esc(alt)}" ${loading}${attrs ? ` ${attrs}` : ''}>`;
}

/* ---------- arch geometry ---------- */
const { W, H, shoulder } = ARCH_TOP;
const archFill = archPath({ W, topH: shoulder, bottom: H, closed: true });

/** Data-URI SVG used as the CSS mask for an arch card's top piece. */
export function archMaskCss() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path d="${archFill.d}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const cuspDots = (cusps, r = 1.8) =>
  cusps
    .slice(1, -1)
    .map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`)
    .join('');

/** Decorative layers for a variable-height arch card (1px line + 1px inner line). */
function archLayers({ fill = true, inset = 6, dots = true, finial = true } = {}) {
  const outer = archPath({ W, topH: shoulder, bottom: H });
  const inner = archPath({ W, topH: shoulder, bottom: H, inset });
  const fillLayer = fill ? `<div class="arch-card__fill" aria-hidden="true"></div>` : '';
  return `${fillLayer}<div class="arch-card__frame" aria-hidden="true" style="--inset:${inset}">
    <svg class="arch-card__top" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" focusable="false">
      <path class="arch-card__line" d="${outer.d}"/>
      <path class="arch-card__line arch-card__line--inner" d="${inner.d}"/>
      ${dots ? `<g class="arch-card__dots">${cuspDots(outer.cusps, 1.4)}</g>` : ''}
      ${finial ? `<use href="#o-finial" class="arch-card__finial" x="${W / 2 - 8}" y="-8" width="16" height="20"/>` : ''}
    </svg>
    <span class="arch-card__sides"></span>
  </div>`;
}

/* Fixed-aspect clip shapes (objectBoundingBox) */
const clipShape = (w, h, topH) =>
  archPath({ W: w, topH, bottom: h, closed: true, sx: 1 / w, sy: 1 / h }).d;
const PHOTO = { W: 300, H: 420, top: 128 };
const WINDOW = { W: 300, H: 200, top: 96 };
const photoLine = archPath({ W: PHOTO.W, topH: PHOTO.top, bottom: PHOTO.H, closed: true });
const photoOuter = archPath({ W: PHOTO.W, topH: PHOTO.top, bottom: PHOTO.H + 8, inset: -8, closed: true });
const windowLine = archPath({ W: WINDOW.W, topH: WINDOW.top, bottom: WINDOW.H, closed: true });

/* ---------- section dividers ---------- */
// colour at the bottom (from) / top (to) of each themed section
const BOTTOM = { ivory: '#FBF5EE', emerald: '#0B2E23', blush: '#F3D9DC', photo: '#0B2E23' };
const TOP = { ivory: '#FBF5EE', emerald: '#0F3D2E', blush: '#F3D9DC', photo: '#0B2E23' };

/** A row of scalloped jharokha arches rising into the previous section. */
function arcadeEdge(from, to) {
  const n = 9;
  const w = 400 / n;
  let fillD = 'M0 30';
  let lineD = '';
  for (let i = 0; i < n; i++) {
    const d = archPath({ W: w, topH: 18, bottom: 18, apex: 4, lobes: 2, ox: i * w }).d;
    fillD += d.replace(/^M/, 'L');
    lineD += i === 0 ? d : d.replace(/^M/, 'L');
  }
  fillD += 'L400 30Z';
  return `<div class="edge edge--arcade" aria-hidden="true" style="--from:${BOTTOM[from]};--to:${TOP[to]}">
    <svg viewBox="0 0 400 30" preserveAspectRatio="none" focusable="false">
      <path d="${fillD}" fill="var(--to)"/>
      <path d="${lineD}" fill="none" stroke="#C9A45C" stroke-width="1" vector-effect="non-scaling-stroke"/>
    </svg>
  </div>`;
}

/** A soft rising curve with a gold filigree line and a lotus medallion. */
function filigreeEdge(from, to) {
  return `<div class="edge edge--filigree" aria-hidden="true" style="--from:${BOTTOM[from]};--to:${TOP[to]}">
    <svg viewBox="0 0 400 44" preserveAspectRatio="none" focusable="false">
      <path d="M0 44V30C110 30 150 12 200 12S290 30 400 30V44Z" fill="var(--to)"/>
      <path d="M0 30C110 30 150 12 200 12S290 30 400 30" fill="none" stroke="#C9A45C" stroke-width="1" vector-effect="non-scaling-stroke"/>
      <path d="M40 36C120 36 155 20 200 20S280 36 360 36" fill="none" stroke="#C9A45C" stroke-opacity=".45" stroke-width="1" vector-effect="non-scaling-stroke"/>
    </svg>
    <span class="edge__lotus">${use('o-lotus', '')}</span>
  </div>`;
}

const edgeBetween = (from, to) => (to === 'emerald' ? arcadeEdge(from, to) : filigreeEdge(from, to));

/* ---------- section pieces ---------- */
const sectionHead = (eyebrow, title, sub = '', id = '') => `
  <header class="sec-head">
    ${eyebrow ? `<p class="eyebrow reveal">${esc(eyebrow)}</p>` : ''}
    <h2 class="script-title reveal reveal--script"${id ? ` id="${id}"` : ''}>${esc(title)}</h2>
    <div class="reveal">${divider()}</div>
    ${sub ? `<p class="sec-head__sub reveal">${esc(sub)}</p>` : ''}
  </header>`;

function doors(c) {
  const d = c.doors;
  return `
  <div class="doors" role="dialog" aria-modal="true" aria-label="Wedding invitation">
    <div class="doors__stage">
      <div class="doors__bloom" aria-hidden="true"></div>
      <div class="doors__leaf doors__leaf--l">${doorLeaf('l')}</div>
      <div class="doors__leaf doors__leaf--r">${doorLeaf('r')}</div>
      ${doorFrame()}
      <button type="button" class="doors__open">
        <span class="doors__seal" aria-hidden="true">
          <span>${esc(d.monogram[0])}</span><i></i><span>${esc(d.monogram[1])}</span>
        </span>
        <span class="doors__prompt">${esc(d.prompt)}</span>
        <span class="visually-hidden"> — open the wedding invitation of ${esc(c.couple.bride)} and ${esc(c.couple.groom)}</span>
      </button>
    </div>
  </div>`;
}

function hero(c, venue) {
  const h = c.hero;
  const media = venue
    ? `<div class="hero__media">${img(h.image, { alt: h.imageAlt, sizes: '(min-width: 600px) 480px, 100vw', cls: 'hero__img', eager: true })}</div>`
    : `<div class="hero__plain" aria-hidden="true"></div>`;
  return {
    theme: 'photo',
    html: `
  <section class="hero" id="cover" aria-label="Cover">
    ${media}
    <div class="hero__shade" aria-hidden="true"></div>
    <div class="petals" aria-hidden="true"></div>
    <div class="hero__frame arch-card">${archLayers({ fill: false, inset: 5, dots: false })}</div>
    <div class="hero__content">
      <p class="eyebrow eyebrow--light hero__in" style="--i:0">${esc(h.preface)}</p>
      <h1 class="hero__names">
        <span class="hero__name foil hero__in" style="--i:1" data-text="${esc(c.couple.bride)}">${esc(c.couple.bride)}</span>
        <span class="hero__weds hero__in" style="--i:2">${esc(h.weds)}</span>
        <span class="hero__name foil hero__in" style="--i:3" data-text="${esc(c.couple.groom)}">${esc(c.couple.groom)}</span>
      </h1>
      <div class="hero__in" style="--i:4">${divider('divider--light')}</div>
      <p class="hero__date hero__in" style="--i:5">${esc(h.dateLine)} <span aria-hidden="true">·</span> ${esc(h.city)}</p>
      <p class="hero__tag hero__in" style="--i:6">${esc(c.hashtag)}</p>
    </div>
    <a class="scroll-cue" href="#invitation" aria-label="Scroll to the invitation">
      <span>${esc(h.scrollLabel)}</span>${use('i-chevron', 'scroll-cue__icon')}
    </a>
  </section>`,
  };
}

function invitation(c) {
  const v = c.invitation;
  return {
    theme: 'ivory',
    html: `
  <section class="section theme-ivory section--invite" id="invitation" aria-labelledby="invite-title">
    <h2 class="visually-hidden" id="invite-title">Wedding invitation</h2>
    <div class="arch-card invite">
      ${archLayers({ inset: 6 })}
      ${use('o-filigree', 'corner corner--bl')}
      ${use('o-filigree', 'corner corner--br')}
      <div class="arch-card__content invite__content">
        <p class="invocation reveal" lang="hi">${esc(v.invocation)}</p>
        <p class="invite__text reveal">${lines(v.blessing)}</p>
        <p class="invite__hosts reveal">${names(v.hosts)}</p>
        <p class="invite__text reveal">${lines(v.request)}</p>
        <p class="name-script reveal reveal--script">${esc(v.bride.name)}</p>
        <p class="invite__parent reveal">${lines(v.bride.lines)}</p>
        <p class="invite__with reveal">${esc(v.connector)}</p>
        <p class="name-script reveal reveal--script">${esc(v.groom.name)}</p>
        <p class="invite__parent reveal">${lines(v.groom.lines)}</p>
        <div class="reveal">${divider('divider--small')}</div>
      </div>
    </div>
  </section>`,
  };
}

function meetCouple(c) {
  const m = c.meetCouple;
  const largest = (key) => variants(key)[variants(key).length - 1].src;
  const slides = m.photos
    .map(
      (p, i) => `
      <li class="carousel__slide">
        <button type="button" class="carousel__btn" data-full="${esc(largest(p.image))}" data-alt="${esc(p.alt)}"
          aria-label="Enlarge photo ${i + 1} of ${m.photos.length}: ${esc(p.alt)}">
          ${img(p.image, { alt: p.alt, sizes: '(min-width: 600px) 350px, 72vw' })}
        </button>
      </li>`,
    )
    .join('');
  const dots = m.photos
    .map((_, i) => `<button type="button" class="carousel__dot" aria-label="Show photo ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}></button>`)
    .join('');
  return {
    theme: 'emerald',
    html: `
  <section class="section theme-emerald section--couple" id="couple" aria-labelledby="couple-title">
    ${sectionHead(m.eyebrow, m.title, '', 'couple-title')}
    <figure class="photo-arch">
      <div class="photo-arch__box">
        <div class="photo-arch__clip">
          <div class="wipe reveal-img"><div class="parallax" data-parallax="14">${img(m.feature.image, { alt: m.feature.alt, sizes: '(min-width: 600px) 330px, 80vw' })}</div></div>
        </div>
        <svg class="photo-arch__frame" viewBox="0 0 ${PHOTO.W} ${PHOTO.H}" aria-hidden="true" focusable="false">
          <path class="photo-arch__line" d="${photoLine.d}"/>
          <path class="photo-arch__line photo-arch__line--outer" d="${photoOuter.d}"/>
          <g class="photo-arch__dots">${cuspDots(photoOuter.cusps, 1.8)}</g>
          <use href="#o-finial" x="${PHOTO.W / 2 - 11}" y="-30" width="22" height="28" class="photo-arch__finial"/>
        </svg>
      </div>
      <figcaption class="photo-arch__names foil reveal reveal--script" data-text="${esc(m.names)}">${esc(m.names)}</figcaption>
    </figure>
    <div class="carousel reveal" data-carousel>
      <ul class="carousel__track" role="list" aria-label="More photos of the couple">${slides}</ul>
      <div class="carousel__dots">${dots}</div>
      <p class="carousel__hint">${esc(m.stripHint)}</p>
    </div>
  </section>`,
  };
}

/* ---------- calendar (.ics) ---------- */
const icsEscape = (s) => String(s).replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
const icsDate = (local) => local.replace(/[-:]/g, '').padEnd(15, '0').slice(0, 15);
/* RFC 5545: fold lines longer than 75 octets (UTF-8 bytes, not characters) */
function icsFold(line) {
  const out = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (bytes + n > 74) {
      out.push(cur);
      cur = ' ';
      bytes = 1;
    }
    cur += ch;
    bytes += n;
  }
  out.push(cur);
  return out.join('\r\n');
}
export function icsFor(ev, c) {
  const couple = `${c.couple.bride} & ${c.couple.groom}`;
  const details = ev.timings.map((t) => [t.label, t.time].filter(Boolean).join(' – ')).join('\n');
  const desc = `${couple}\n${details}${isPlaceholder(ev.map) ? '' : `\nMap: ${ev.map}`}`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const rows = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Kolkata',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0530',
    'TZOFFSETTO:+0530',
    'TZNAME:IST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${ev.id}-${icsDate(ev.calendar.start)}@wedding-invitation`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Asia/Kolkata:${icsDate(ev.calendar.start)}`,
    `DTEND;TZID=Asia/Kolkata:${icsDate(ev.calendar.end)}`,
    `SUMMARY:${icsEscape(`${ev.name} · ${couple}`)}`,
    `LOCATION:${icsEscape(ev.venue)}`,
    `DESCRIPTION:${icsEscape(desc)}`,
    ...(isPlaceholder(ev.map) ? [] : [`URL:${ev.map}`]),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return rows.map(icsFold).join('\r\n') + '\r\n';
}

function eventCard(ev, i, c, venue) {
  const t = c.timeline;
  const [y, mo, d] = ev.calendar.start.slice(0, 10).split('-').map(Number);
  const timings = ev.timings
    .map((x) =>
      x.label
        ? `<li><span class="event__label">${esc(x.label)}</span><span class="event__leader" aria-hidden="true"></span><span class="event__time">${esc(x.time)}</span></li>`
        : `<li class="is-solo"><span class="event__leader" aria-hidden="true"></span><span class="event__time">${esc(x.time)}</span><span class="event__leader" aria-hidden="true"></span></li>`,
    )
    .join('');
  const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor(ev, c))}`;
  const slug = `${c.couple.bride}-${c.couple.groom}-${ev.id}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const windowArt =
    venue && ev.photo
      ? `<div class="parallax" data-parallax="12">${img(ev.photo, { alt: '', sizes: '(min-width: 600px) 400px, 80vw' })}</div>`
      : `<div class="event__plain">${use('o-lotus', 'event__plain-lotus')}</div>`;
  return `
    <article class="event" aria-labelledby="ev-${esc(ev.id)}">
      <span class="timeline__node" aria-hidden="true"></span>
      <div class="event__card reveal">
        <div class="event__window">
          <div class="event__clip"><div class="wipe reveal-img">${windowArt}</div></div>
          <svg class="event__window-line" viewBox="0 0 ${WINDOW.W} ${WINDOW.H}" aria-hidden="true" focusable="false"><path d="${windowLine.d}"/></svg>
        </div>
        <div class="event__stamp" aria-label="${esc(ev.day)}, ${esc(ev.date)}">
          <span class="event__stamp-day">${d}</span>
          <span class="event__stamp-month">${MONTHS[mo - 1]} ${y}</span>
        </div>
        <div class="event__body">
          <p class="event__weekday">${esc(ev.day)}</p>
          <h3 class="event__name" id="ev-${esc(ev.id)}">${esc(ev.name)}</h3>
          <ul class="event__timings" role="list">${timings}</ul>
          <p class="event__venue">${use('i-pin', 'icon')}<span>${esc(ev.venue)}</span></p>
          <div class="event__actions">
            ${
              isPlaceholder(ev.map)
                ? ''
                : `<a class="btn btn--gold" href="${esc(ev.map)}" target="_blank" rel="noopener noreferrer">${use('i-pin', 'icon')}${esc(t.mapLabel)}<span class="visually-hidden"> for ${esc(ev.name)} (opens Google Maps)</span></a>`
            }
            <a class="btn btn--ghost" href="${ics}" download="${slug}.ics">${use('i-calendar', 'icon')}${esc(t.calendarLabel)}<span class="visually-hidden"> – ${esc(ev.name)}</span></a>
          </div>
        </div>
      </div>
    </article>`;
}

function timeline(c, venue) {
  const t = c.timeline;
  const cards = t.events
    .map((ev, i) => {
      let html = eventCard(ev, i, c, venue);
      if (t.kidsNote && t.kidsNote.afterEvent === i) {
        html += `
    <div class="kids">
      <div class="kids__tag reveal reveal--swing">
        <span class="kids__string" aria-hidden="true"></span>
        <span class="kids__hole" aria-hidden="true"></span>
        <p>${esc(t.kidsNote.text)}</p>
      </div>
    </div>`;
      }
      return html;
    })
    .join('');
  return {
    theme: 'ivory',
    html: `
  <section class="section theme-ivory section--events" id="events" aria-labelledby="events-title">
    ${sectionHead(t.eyebrow, t.title, t.subtitle, 'events-title')}
    <div class="timeline">
      <div class="timeline__rail" aria-hidden="true"><span class="timeline__line"></span></div>
      ${cards}
    </div>
  </section>`,
  };
}

function setting(c) {
  const g = c.setting;
  const slides = g.images
    .map(
      (s) => `
      <li class="gallery__slide">
        <figure>
          <div class="gallery__frame"><div class="wipe reveal-img">${img(s.image, { alt: s.alt, sizes: '(min-width: 600px) 408px, 85vw' })}</div></div>
          <figcaption>${esc(s.caption)}</figcaption>
        </figure>
      </li>`,
    )
    .join('');
  return {
    theme: 'emerald',
    html: `
  <section class="section theme-emerald section--setting" id="setting" aria-labelledby="setting-title">
    ${sectionHead(g.eyebrow, g.title, g.text, 'setting-title')}
    <ul class="gallery" role="list" aria-label="Venue décor gallery" tabindex="0">${slides}</ul>
  </section>`,
  };
}

function family(c) {
  const f = c.family;
  const groups = f.groups
    .map((g, i) => {
      const members = g.members.map((m) => `<span class="family__line reveal">${names(m)}</span>`).join('');
      return `
      ${i > 0 && !g.card ? `<div class="hairline reveal" aria-hidden="true"><span></span>${use('o-lotus', 'hairline__lotus')}<span></span></div>` : ''}
      <div class="family__group${g.card ? ' family__group--card' : ''}">
        ${g.title ? `<h3 class="family__title reveal">${esc(g.title)}</h3>` : ''}
        <p class="family__members">${members}</p>
      </div>`;
    })
    .join('');
  return {
    theme: 'ivory',
    html: `
  <section class="section theme-ivory section--family" id="family" aria-labelledby="family-title">
    ${sectionHead(f.eyebrow, f.title, '', 'family-title')}
    <div class="family">${groups}</div>
  </section>`,
  };
}

function rsvp(c) {
  const r = c.rsvp;
  const placeholders = [];
  const contacts = r.contacts
    .map((p) => {
      if (isPlaceholder(p.name) || isPlaceholder(p.phone)) placeholders.push(`${p.name} ${p.phone}`);
      return `
      <li class="contact">
        <span class="contact__who"><span class="contact__name">${esc(p.name)}</span><span class="contact__num">${esc(p.phone)}</span></span>
        <a class="contact__call" href="${esc(telHref(p.phone))}" aria-label="Call ${esc(p.name)} on ${esc(p.phone)}">${use('i-phone', 'icon')}</a>
      </li>`;
    })
    .join('');
  const waPlaceholder = isPlaceholder(r.whatsapp);
  if (waPlaceholder) placeholders.push(`WhatsApp ${r.whatsapp}`);
  const wa = waPlaceholder
    ? `<a class="btn btn--gold btn--big is-placeholder" role="link" aria-disabled="true">${use('i-chat', 'icon')}${esc(r.whatsappLabel)}</a>`
    : `<a class="btn btn--gold btn--big" href="https://wa.me/${esc(String(r.whatsapp).replace(/\D/g, ''))}?text=${encodeURIComponent(r.whatsappMessage)}" target="_blank" rel="noopener noreferrer">${use('i-chat', 'icon')}${esc(r.whatsappLabel)}</a>`;
  return {
    theme: 'blush',
    html: `
  <section class="section theme-blush section--rsvp" id="rsvp" aria-labelledby="rsvp-title"${placeholders.length ? ` data-placeholders="${esc(placeholders.join(' | '))}"` : ''}>
    <div class="rsvp reveal">
      ${use('o-filigree', 'corner corner--tl')}
      ${use('o-filigree', 'corner corner--tr')}
      <h2 class="rsvp__title" id="rsvp-title">${esc(r.title)}</h2>
      ${divider()}
      <p class="rsvp__sub">${esc(r.subtitle)}</p>
      <ul class="contacts" role="list">${contacts}</ul>
      ${wa}
    </div>
  </section>`,
  };
}

function countdown(c) {
  const k = c.countdown;
  const tiles = ['days', 'hours', 'minutes', 'seconds']
    .map(
      (u, i) => `
      <div class="tile reveal"><span class="tile__num" data-unit="${u}"><span class="tile__digit">--</span></span><span class="tile__label">${esc(k.labels[i])}</span></div>`,
    )
    .join('');
  return {
    theme: 'emerald',
    html: `
  <section class="section theme-emerald section--countdown" id="countdown" aria-labelledby="countdown-title">
    <div class="countdown" data-target="${esc(k.target)}">
      <h2 class="script-title reveal reveal--script" id="countdown-title">${esc(k.title)}</h2>
      <div class="reveal">${divider('divider--light')}</div>
      <p class="countdown__text reveal">${esc(k.text)}</p>
      <div class="tiles" role="timer" aria-label="Time remaining until the celebrations">${tiles}</div>
      <p class="countdown__done script-title" hidden>${esc(k.done)}</p>
    </div>
  </section>`,
  };
}

function closing(c, venue) {
  const x = c.closing;
  const petals = Array.from({ length: 11 }, (_, i) => `<i style="--r:${(i * 47) % 90 - 45}deg;--o:${0.55 + ((i * 13) % 40) / 100}"></i>`).join('');
  return {
    theme: 'emerald',
    html: `
  <section class="closing theme-emerald${venue ? '' : ' closing--plain'}" aria-label="Closing note">
    ${venue ? `<div class="closing__media">${img(x.image, { alt: x.imageAlt, sizes: '(min-width: 600px) 480px, 100vw', cls: 'closing__img' })}</div>` : '<div class="petals petals--closing" aria-hidden="true"></div>'}
    <div class="closing__text">
      <p class="closing__signoff foil reveal reveal--script" data-text="${esc(x.signoff)}">${esc(x.signoff)}</p>
      <div class="reveal">${divider('divider--light divider--small')}</div>
      <p class="closing__line reveal">${esc(x.line)}</p>
      <p class="closing__tag reveal">${esc(c.hashtag)}</p>
      <div class="petal-row reveal" aria-hidden="true">${petals}</div>
    </div>
  </section>
  <footer class="footer"><p>${esc(c.footer)}</p></footer>`,
  };
}

function chrome(c) {
  return `
  <div class="music" data-src="${esc(c.music.src)}" hidden>
    <span class="music__hint">${esc(c.music.hint)}</span>
    <button type="button" class="music__btn" aria-label="Play music" aria-pressed="false">
      ${use('i-note', 'icon music__idle')}${use('i-pause', 'icon music__pause')}
    </button>
  </div>
  <dialog class="lightbox" aria-label="Photo viewer">
    <button type="button" class="lightbox__close" aria-label="Close photo">${use('i-close', 'icon')}</button>
    <img class="lightbox__img" alt="">
  </dialog>`;
}

/* ---------- public API ---------- */
export function renderBody(c) {
  const venue = c.SHOW_VENUE_RENDERS !== false;
  const clips = `<svg class="sprite" aria-hidden="true" focusable="false"><defs>
    <clipPath id="clip-photo-arch" clipPathUnits="objectBoundingBox"><path d="${clipShape(PHOTO.W, PHOTO.H, PHOTO.top)}"/></clipPath>
    <clipPath id="clip-window" clipPathUnits="objectBoundingBox"><path d="${clipShape(WINDOW.W, WINDOW.H, WINDOW.top)}"/></clipPath>
  </defs></svg>`;

  const sections = [
    hero(c, venue),
    invitation(c),
    meetCouple(c),
    timeline(c, venue),
    ...(venue ? [setting(c)] : []),
    family(c),
    rsvp(c),
    countdown(c),
    closing(c, venue),
  ];
  let html = '';
  sections.forEach((s, i) => {
    const prev = sections[i - 1];
    // the hero photo fades into the invitation itself, so no edge there
    if (prev && prev.theme !== 'photo' && prev.theme !== s.theme) html += edgeBetween(prev.theme, s.theme);
    html += s.html;
  });

  return `${sprite(doorSymbol())}${clips}
  ${doors(c)}
  <div class="backdrop${venue ? ' backdrop--photo' : ''}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <main class="page" id="top">${html}
  </main>
  ${chrome(c)}`;
}

const FONT_FACES = `
@font-face{font-family:'Pinyon Script';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/PinyonScript-400.woff2) format('woff2')}
@font-face{font-family:'Cormorant Garamond';font-style:normal;font-weight:500 600;font-display:swap;src:url(/fonts/CormorantGaramond-var.woff2) format('woff2')}
@font-face{font-family:'Cormorant Garamond';font-style:italic;font-weight:500;font-display:swap;src:url(/fonts/CormorantGaramond-500i.woff2) format('woff2')}
@font-face{font-family:'Cinzel';font-style:normal;font-weight:500;font-display:swap;src:url(/fonts/Cinzel-500.woff2) format('woff2')}`;

export function renderHead(c, { siteUrl = '' } = {}) {
  const m = c.meta;
  const venue = c.SHOW_VENUE_RENDERS !== false;
  const base = siteUrl.replace(/\/$/, '');
  const abs = (p) => (base ? `${base}${p}` : p);
  const fontsHindi = `https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@500&display=swap&text=${encodeURIComponent(c.invitation.invocation)}`;
  const heroV = venue ? variants(c.hero.image) : [];
  return `
    <title>${esc(m.title)}</title>
    <meta name="description" content="${esc(m.description)}">
    <meta name="theme-color" content="#0B2E23">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    ${base ? `<link rel="canonical" href="${esc(base)}/">` : ''}

    <meta property="og:type" content="website">
    <meta property="og:title" content="${esc(m.title)}">
    <meta property="og:description" content="${esc(m.description)}">
    <meta property="og:image" content="${esc(abs(m.ogImage))}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${esc(m.ogImageAlt)}">
    ${base ? `<meta property="og:url" content="${esc(base)}/">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(m.title)}">
    <meta name="twitter:description" content="${esc(m.description)}">
    <meta name="twitter:image" content="${esc(abs(m.ogImage))}">
    <meta name="twitter:image:alt" content="${esc(m.ogImageAlt)}">

    <link rel="preload" href="/fonts/PinyonScript-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/CormorantGaramond-var.woff2" as="font" type="font/woff2" crossorigin>
    ${venue ? `<link rel="preload" as="image" href="${heroV[heroV.length - 1].src}" imagesrcset="${heroV.map((x) => `${x.src} ${x.w}w`).join(', ')}" imagesizes="(min-width: 600px) 480px, 100vw" fetchpriority="high">` : ''}
    <style>${FONT_FACES}
:root{--arch-mask:${archMaskCss()}}</style>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="${esc(fontsHindi)}" media="print" onload="this.media='all'">
    <script>(function(d){d.classList.add('js');try{if(!sessionStorage.getItem('tu-doors'))d.classList.add('doors-up')}catch(e){d.classList.add('doors-up')}})(document.documentElement)</script>`;
}
