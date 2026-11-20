/**
 * Carved Rajasthani palace doors for the opening overlay — original SVG.
 *
 * One <symbol> (viewBox 400 x 860) holds both door leaves. Each leaf is an
 * <svg> that shows half of it (left: x 0–200, right: x 200–400), so the two
 * halves meet exactly on the seam. A static carved frame with the scalloped
 * arch sits on top and stays put while the leaves swing open.
 */
import { archPath } from './arch.js';

const W = 400;
const H = 860;
const ARCH = { W, topH: 196, bottom: H, apex: 34, lobes: 6 };

const n = (v) => Math.round(v * 10) / 10;

function rosette(cx, cy, r) {
  let petals = '';
  for (let i = 0; i < 8; i++) {
    petals += `<ellipse cx="${cx}" cy="${n(cy - r * 0.55)}" rx="${n(r * 0.22)}" ry="${n(r * 0.48)}" transform="rotate(${i * 45} ${cx} ${cy})"/>`;
  }
  return `<g fill="url(#dr-gold)" fill-opacity=".92">${petals}</g>
    <circle cx="${cx}" cy="${cy}" r="${n(r * 1.08)}" fill="none" stroke="url(#dr-gold)" stroke-width="1.2"/>
    <circle cx="${cx}" cy="${cy}" r="${n(r * 0.22)}" fill="#F7E4B0"/>`;
}

/** One door leaf's carvings; mirror=true draws the right leaf. */
function leaf(mirror) {
  const X = (x) => (mirror ? W - x : x);
  const px = mirror ? W - 172 : 28; // panel left edge
  const pw = 144;
  const topPanel = archPath({ W: pw, topH: 46, bottom: 236, apex: 8, lobes: 3, closed: true, ox: px, oy: 236 }).d;
  const topInner = archPath({ W: pw, topH: 46, bottom: 236, apex: 8, lobes: 3, inset: 7, closed: true, ox: px, oy: 234 }).d;
  let studs = '';
  for (let y = 226; y <= 840; y += 26) {
    studs += `<use href="#dr-stud" x="${X(13)}" y="${y}"/><use href="#dr-stud" x="${X(187)}" y="${y}"/>`;
  }
  for (const y of [212, 494, 826]) {
    for (let x = 33; x <= 167; x += 22) studs += `<use href="#dr-stud" x="${X(x)}" y="${y}"/>`;
  }
  const ring = X(184);
  return `
    <path d="${topPanel}" fill="url(#dr-panel)" stroke="url(#dr-gold)" stroke-width="1.8"/>
    <path d="${topInner}" fill="none" stroke="#C9A45C" stroke-opacity=".7" stroke-width=".9"/>
    <rect x="${px}" y="520" width="${pw}" height="282" rx="4" fill="url(#dr-panel)" stroke="url(#dr-gold)" stroke-width="1.8"/>
    <rect x="${px + 7}" y="527" width="${pw - 14}" height="268" rx="2" fill="none" stroke="#C9A45C" stroke-opacity=".7" stroke-width=".9"/>
    ${rosette(px + pw / 2, 372, 26)}
    ${rosette(px + pw / 2, 661, 30)}
    ${studs}
    <circle cx="${ring}" cy="${514}" r="15" fill="none" stroke="url(#dr-gold)" stroke-width="3.2"/>
    <circle cx="${ring}" cy="${497}" r="5" fill="url(#dr-gold)"/>`;
}

export function doorSymbol() {
  const opening = archPath({ ...ARCH, closed: true }).d;
  // lattice inside the arch head, above the panels
  let jali = '';
  for (let x = -200; x < W + 200; x += 18) {
    jali += `M${x} 30L${x + 190} 220M${x + 190} 30L${x} 220`;
  }
  return `
  <linearGradient id="dr-gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F7E4B0"/><stop offset=".45" stop-color="#D6B26B"/><stop offset="1" stop-color="#A47C3B"/>
  </linearGradient>
  <linearGradient id="dr-wood" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#0B2E23"/><stop offset=".5" stop-color="#11473A"/><stop offset="1" stop-color="#0B2E23"/>
  </linearGradient>
  <linearGradient id="dr-panel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#145A47"/><stop offset="1" stop-color="#0E3F31"/>
  </linearGradient>
  <radialGradient id="dr-stud-g" cx="35%" cy="35%" r="65%">
    <stop offset="0" stop-color="#FFF4D2"/><stop offset=".5" stop-color="#D6B26B"/><stop offset="1" stop-color="#7E5C26"/>
  </radialGradient>
  <clipPath id="dr-opening"><path d="${opening}"/></clipPath>
  <g id="dr-stud"><circle r="3.6" fill="url(#dr-stud-g)"/></g>
  <symbol id="door-art" viewBox="0 0 ${W} ${H}">
    <g clip-path="url(#dr-opening)">
      <rect width="${W}" height="${H}" fill="url(#dr-wood)"/>
      <path d="${jali}" stroke="#C9A45C" stroke-opacity=".28" stroke-width="1"/>
      ${leaf(false)}
      ${leaf(true)}
      <path d="M200 0V${H}" stroke="#04140F" stroke-width="2.4"/>
      <path d="M197.6 0V${H}M202.4 0V${H}" stroke="#C9A45C" stroke-opacity=".55" stroke-width=".6"/>
    </g>
  </symbol>`;
}

/** Static carved frame (wall with the arch cut out). */
export function doorFrame() {
  const opening = archPath({ ...ARCH, closed: true }).d;
  const outer = archPath({ ...ARCH }).d;
  const inner = archPath({ ...ARCH, inset: 9 }).d;
  const molding = archPath({ ...ARCH, inset: -10 }).d;
  return `<svg class="doors__frame" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
    <path d="M-400 -10H${W + 400}V${H + 10}H-400Z ${opening}" fill="#061D17" fill-rule="evenodd"/>
    <path d="${molding}" fill="none" stroke="#C9A45C" stroke-opacity=".45" stroke-width="1"/>
    <path d="${outer}" fill="none" stroke="url(#dr-gold)" stroke-width="3"/>
    <path d="${inner}" fill="none" stroke="#C9A45C" stroke-opacity=".8" stroke-width="1"/>
  </svg>`;
}

export const doorLeaf = (side) =>
  side === 'l'
    ? `<svg class="doors__art" viewBox="0 0 200 ${H}" preserveAspectRatio="xMaxYMin slice" aria-hidden="true" focusable="false"><use href="#door-art" width="${W}" height="${H}"/></svg>`
    : `<svg class="doors__art" viewBox="200 0 200 ${H}" preserveAspectRatio="xMinYMin slice" aria-hidden="true" focusable="false"><use href="#door-art" width="${W}" height="${H}"/></svg>`;
