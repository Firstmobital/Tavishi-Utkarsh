/**
 * Renders the invitation markup from src/content.js.
 * Runs at build time (and on every dev request) via the Vite plugin in
 * vite.config.js, so the page ships as fully rendered static HTML.
 * Pure functions only — no DOM access.
 */
import { archPath, ARCH_TOP } from './lib/arch.js';
import { sprite, use, divider } from './lib/ornaments.js';
import { heroScene, eventArt, settingScene, gazeboScene } from './lib/scenes.js';

/* ---------- helpers ---------- */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
const lines = (arr) => arr.map(esc).join('<br>');
export const isPlaceholder = (s) => !s || /PLACEHOLDER|X{4,}/i.test(String(s));
/** srcset for generated variants: "x-900.webp" → "x-480.webp 480w, x-900.webp 900w" */
const srcset = (src, sizes) => {
  const m = /^(.*)-(800|900)\.webp$/.exec(src);
  if (!m) return '';
  return ` srcset="${esc(`${m[1]}-480.webp 480w, ${src} ${m[2]}w`)}" sizes="${esc(sizes)}"`;
};
const telHref = (p) => `tel:${String(p).replace(/[^\d+]/g, '')}`;

/* ---------- arch geometry ---------- */
const { W, H, shoulder } = ARCH_TOP;
const INSET = 7;
const archOuter = archPath({ W, topH: shoulder, bottom: H });
const archInner = archPath({ W, topH: shoulder, bottom: H, inset: INSET });
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

/** Decorative layers for a variable-height arch card. */
function archLayers({ fill = true } = {}) {
  const fillLayer = fill ? `<div class="arch-card__fill" aria-hidden="true"></div>` : '';
  return `${fillLayer}<div class="arch-card__frame" aria-hidden="true">
    <svg class="arch-card__top" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" focusable="false">
      <path class="arch-card__line" d="${archOuter.d}"/>
      <path class="arch-card__line arch-card__line--inner" d="${archInner.d}"/>
      <g class="arch-card__dots">${cuspDots(archOuter.cusps)}</g>
      <use href="#o-finial" class="arch-card__finial" x="${W / 2 - 9}" y="-9" width="18" height="22"/>
    </svg>
    <span class="arch-card__sides"></span>
  </div>`;
}

/* Fixed-aspect photo arch (couple portrait) */
const PHOTO = { W: 300, H: 420 };
const photoClip = archPath({
  W: PHOTO.W,
  topH: 128,
  bottom: PHOTO.H,
  closed: true,
  sx: 1 / PHOTO.W,
  sy: 1 / PHOTO.H,
});
const photoLine = archPath({ W: PHOTO.W, topH: 128, bottom: PHOTO.H, closed: true });
const photoOuter = archPath({ W: PHOTO.W, topH: 128, bottom: PHOTO.H + 8, inset: -8, closed: true });

/* ---------- section pieces ---------- */
const sectionHead = (eyebrow, title, sub = '', id = '') => `
  <header class="sec-head reveal">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h2 class="script-title"${id ? ` id="${id}"` : ''}>${esc(title)}</h2>
    ${divider()}
    ${sub ? `<p class="sec-head__sub">${esc(sub)}</p>` : ''}
  </header>`;

function hero(c) {
  const h = c.hero;
  return `
  <section class="hero" id="cover" aria-label="Cover">
    <div class="hero__sky" aria-hidden="true"></div>
    <div class="twinkles" aria-hidden="true"></div>
    <div class="hero__scene-wrap" aria-hidden="true">${heroScene()}</div>
    <div class="petals" aria-hidden="true"></div>
    <div class="hero__frame arch-card arch-card--outline">${archLayers({ fill: false })}</div>
    ${use('o-strand', 'strand strand--1')}
    ${use('o-strand', 'strand strand--2')}
    ${use('o-strand', 'strand strand--3')}
    ${use('o-strand', 'strand strand--4')}
    ${use('o-sprig', 'sprig sprig--hero-l')}
    ${use('o-sprig', 'sprig sprig--hero-r')}
    <div class="hero__content">
      <p class="eyebrow eyebrow--light hero__in" style="--i:0">${esc(h.preface)}</p>
      <h1 class="hero__names">
        <span class="hero__name hero__in" style="--i:1">${esc(c.couple.bride)}</span>
        <span class="hero__weds hero__in" style="--i:2">${esc(h.weds)}</span>
        <span class="hero__name hero__in" style="--i:3">${esc(c.couple.groom)}</span>
      </h1>
      <div class="hero__in" style="--i:4">${divider('divider--light')}</div>
      <p class="hero__date hero__in" style="--i:5">${esc(h.dateLine)} <span aria-hidden="true">·</span> ${esc(h.city)}</p>
      <p class="hero__tag hero__in" style="--i:6">${esc(c.hashtag)}</p>
    </div>
    <a class="scroll-cue" href="#invitation" aria-label="Scroll to the invitation">
      <span>${esc(h.scrollLabel)}</span>${use('i-chevron', 'scroll-cue__icon')}
    </a>
    <div class="hero__edge" aria-hidden="true"></div>
  </section>`;
}

function invitation(c) {
  const v = c.invitation;
  return `
  <section class="section section--invite" id="invitation" aria-labelledby="invite-title">
    <h2 class="visually-hidden" id="invite-title">Wedding invitation</h2>
    <div class="arch-card invite reveal">
      ${archLayers()}
      ${use('o-corner', 'corner corner--bl')}
      ${use('o-corner', 'corner corner--br')}
      <div class="arch-card__content invite__content">
        <p class="invocation" lang="hi">${esc(v.invocation)}</p>
        <p class="invite__text">${lines(v.blessing)}</p>
        <p class="invite__hosts">${esc(v.hosts)}</p>
        <p class="invite__text">${lines(v.request)}</p>
        <p class="name-script">${esc(v.bride.name)}</p>
        <p class="invite__parent">${lines(v.bride.lines)}</p>
        <p class="invite__with">${esc(v.connector)}</p>
        <p class="name-script">${esc(v.groom.name)}</p>
        <p class="invite__parent">${lines(v.groom.lines)}</p>
        ${divider('divider--small')}
      </div>
    </div>
  </section>`;
}

function meetCouple(c) {
  const m = c.meetCouple;
  const photos = m.photos
    .map(
      (p, i) => `
      <li class="strip__item">
        <button type="button" class="strip__btn" data-full="${esc(p.full)}" data-alt="${esc(p.alt)}"
          aria-label="Enlarge photo ${i + 1} of ${m.photos.length}: ${esc(p.alt)}">
          <img src="${esc(p.thumb)}"${srcset(p.thumb, '(min-width: 600px) 290px, 62vw')} alt="${esc(p.alt)}" loading="lazy" decoding="async" width="800" height="1000">
        </button>
      </li>`,
    )
    .join('');
  return `
  <section class="section section--couple" id="couple" aria-labelledby="couple-title">
    ${sectionHead(m.eyebrow, m.title, '', 'couple-title')}
    <figure class="photo-arch reveal">
      <div class="photo-arch__box">
      <div class="photo-arch__clip">
        <img src="${esc(m.feature.src)}"${srcset(m.feature.src, '(min-width: 600px) 320px, 76vw')} alt="${esc(m.feature.alt)}" loading="lazy" decoding="async"
          width="${m.feature.width}" height="${m.feature.height}">
      </div>
      <svg class="photo-arch__frame" viewBox="0 0 ${PHOTO.W} ${PHOTO.H}" aria-hidden="true" focusable="false">
        <path class="photo-arch__line" d="${photoLine.d}"/>
        <path class="photo-arch__line photo-arch__line--outer" d="${photoOuter.d}"/>
        <g class="photo-arch__dots">${cuspDots(photoOuter.cusps, 2.2)}</g>
        <use href="#o-finial" x="${PHOTO.W / 2 - 12}" y="-30" width="24" height="30" class="photo-arch__finial"/>
      </svg>
      ${use('o-sprig', 'sprig sprig--photo-l')}
      ${use('o-sprig', 'sprig sprig--photo-r')}
      </div>
      <figcaption class="photo-arch__names">${esc(m.names)}</figcaption>
    </figure>
    <div class="strip-wrap reveal">
      <ul class="strip" role="list" aria-label="More photos of the couple">${photos}</ul>
      <p class="strip__hint">${esc(m.stripHint)}</p>
    </div>
  </section>`;
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

function eventCard(ev, i, c) {
  const t = c.timeline;
  const timings = ev.timings
    .map(
      (x) =>
        `<li>${x.label ? `<span class="event__label">${esc(x.label)}</span>` : ''}<span class="event__time">${esc(x.time)}</span></li>`,
    )
    .join('');
  const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor(ev, c))}`;
  const slug = `${c.couple.bride}-${c.couple.groom}-${ev.id}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  return `
    <article class="arch-card event reveal" style="--d:${(i % 2) * 90}ms" aria-labelledby="ev-${esc(ev.id)}">
      ${archLayers()}
      <div class="arch-card__content event__content">
        ${eventArt(ev.art)}
        <p class="event__date"><span>${esc(ev.day)}</span>${esc(ev.date)}</p>
        <h3 class="event__name" id="ev-${esc(ev.id)}">${esc(ev.name)}</h3>
        <ul class="event__timings" role="list">${timings}</ul>
        <p class="event__venue">${use('i-pin', 'icon')}<span>${esc(ev.venue)}</span></p>
        <div class="event__actions">
          ${
            isPlaceholder(ev.map)
              ? ''
              : `<a class="btn btn--outline" href="${esc(ev.map)}" target="_blank" rel="noopener noreferrer">${use('i-pin', 'icon')}${esc(t.mapLabel)}<span class="visually-hidden"> for ${esc(ev.name)} (opens Google Maps)</span></a>`
          }
          <a class="event__cal" href="${ics}" download="${slug}.ics">${use('i-calendar', 'icon')}${esc(t.calendarLabel)}<span class="visually-hidden"> – ${esc(ev.name)}</span></a>
        </div>
      </div>
    </article>`;
}

function timeline(c) {
  const t = c.timeline;
  const cards = t.events
    .map((ev, i) => {
      let html = eventCard(ev, i, c);
      if (t.kidsNote && t.kidsNote.afterEvent === i) {
        html += `<p class="kids-note reveal">${use('o-lotus', 'kids-note__lotus')}<span>${esc(t.kidsNote.text)}</span></p>`;
      }
      return html;
    })
    .join('');
  return `
  <section class="section section--timeline" id="events" aria-labelledby="events-title">
    ${sectionHead(t.eyebrow, t.title, t.subtitle, 'events-title')}
    <div class="events">${cards}</div>
  </section>`;
}

function setting(c) {
  const g = c.setting;
  return `
  <section class="section section--setting" id="setting" aria-labelledby="setting-title">
    ${sectionHead(g.eyebrow, g.title, '', 'setting-title')}
    <figure class="setting reveal">
      <div class="setting__frame">${settingScene()}</div>
      ${g.text ? `<figcaption class="setting__text">${esc(g.text)}</figcaption>` : ''}
    </figure>
  </section>`;
}

function family(c) {
  const f = c.family;
  const groups = f.groups
    .map(
      (g, i) => `
      ${i > 0 ? `<div class="mini-divider" aria-hidden="true"><span></span>${use('o-lotus', 'mini-divider__lotus')}<span></span></div>` : ''}
      <div class="family__group reveal">
        ${g.title ? `<h3 class="family__title">${esc(g.title)}</h3>` : ''}
        <p class="family__members">${lines(g.members)}</p>
      </div>`,
    )
    .join('');
  return `
  <section class="section section--family" id="family" aria-labelledby="family-title">
    ${use('o-sprig', 'sprig sprig--sec-l')}
    ${use('o-sprig', 'sprig sprig--sec-r')}
    ${sectionHead(f.eyebrow, f.title, '', 'family-title')}
    <div class="family">${groups}</div>
  </section>`;
}

function rsvp(c) {
  const r = c.rsvp;
  const contacts = r.contacts
    .map(
      (p) => `
      <li class="contact">
        <span class="contact__name">${esc(p.name)}</span>
        <a class="contact__phone" href="${esc(telHref(p.phone))}" aria-label="Call ${esc(p.name)} on ${esc(p.phone)}">${use('i-phone', 'icon')}${esc(p.phone)}</a>
      </li>`,
    )
    .join('');
  const wa = isPlaceholder(r.whatsapp)
    ? ''
    : `<a class="btn btn--solid" href="https://wa.me/${esc(String(r.whatsapp).replace(/\D/g, ''))}?text=${encodeURIComponent(r.whatsappMessage)}" target="_blank" rel="noopener noreferrer">${use('i-chat', 'icon')}${esc(r.whatsappLabel)}</a>`;
  return `
  <section class="section section--rsvp" id="rsvp" aria-labelledby="rsvp-title">
    <div class="rsvp reveal">
      <h2 class="rsvp__title" id="rsvp-title">${esc(r.title)}</h2>
      ${divider()}
      <p class="sec-head__sub">${esc(r.subtitle)}</p>
      <ul class="contacts" role="list">${contacts}</ul>
      ${wa}
    </div>
  </section>`;
}

function countdown(c) {
  const k = c.countdown;
  const tiles = ['days', 'hours', 'minutes', 'seconds']
    .map(
      (u, i) => `
      <div class="tile"><span class="tile__num" data-unit="${u}">--</span><span class="tile__label">${esc(k.labels[i])}</span></div>`,
    )
    .join('');
  return `
  <section class="section section--countdown" id="countdown" aria-labelledby="countdown-title">
    <div class="countdown reveal" data-target="${esc(k.target)}">
      <h2 class="script-title script-title--light" id="countdown-title">${esc(k.title)}</h2>
      ${divider('divider--light')}
      <p class="countdown__text">${esc(k.text)}</p>
      <div class="tiles" role="timer" aria-label="Time remaining until the celebrations">${tiles}</div>
      <p class="countdown__done" hidden>${esc(k.done)}</p>
    </div>
  </section>`;
}

function closing(c) {
  const x = c.closing;
  return `
  <section class="closing" aria-label="Closing note">
    ${gazeboScene()}
    <div class="closing__text reveal">
      <p class="closing__signoff">${esc(x.signoff)}</p>
      ${divider('divider--small')}
      <p class="closing__line">${esc(x.line)}</p>
      <p class="closing__tag">${esc(c.hashtag)}</p>
    </div>
  </section>
  <footer class="footer"><p>${esc(c.footer)}</p></footer>`;
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
  const clip = `<svg class="sprite" aria-hidden="true" focusable="false"><defs><clipPath id="clip-photo-arch" clipPathUnits="objectBoundingBox"><path d="${photoClip.d}"/></clipPath></defs></svg>`;
  return `${sprite()}${clip}
  <div class="backdrop" aria-hidden="true"></div>
  <main class="page" id="top">
    ${hero(c)}
    ${invitation(c)}
    ${meetCouple(c)}
    ${timeline(c)}
    ${setting(c)}
    ${family(c)}
    ${rsvp(c)}
    ${countdown(c)}
    ${closing(c)}
  </main>
  ${chrome(c)}`;
}

export function renderHead(c, { siteUrl = '' } = {}) {
  const m = c.meta;
  const base = siteUrl.replace(/\/$/, '');
  const abs = (p) => (base ? `${base}${p}` : p);
  const devanagari = encodeURIComponent(c.invitation.invocation);
  const fonts =
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap';
  const fontsHindi = `https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@500&display=swap&text=${devanagari}`;
  return `
    <title>${esc(m.title)}</title>
    <meta name="description" content="${esc(m.description)}">
    <meta name="theme-color" content="#FBF5EE">
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

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="${fonts}" media="print" onload="this.media='all'">
    <link rel="stylesheet" href="${esc(fontsHindi)}" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="${fonts}"><link rel="stylesheet" href="${esc(fontsHindi)}"></noscript>
    <style>:root{--arch-mask:${archMaskCss()}}</style>
    <script>document.documentElement.classList.add('js')</script>`;
}
