/**
 * Opening gatefold: two emerald velvet panels meeting at a seam, a faint
 * embossed jharokha arch across both, fine gold edges, and a lace-edged
 * ivory seal with the couple's monogram. Original SVG.
 *
 * One <symbol> (viewBox 400 x 860) holds both panels. Each leaf is an <svg>
 * that shows half of it (left: x 0–200, right: x 200–400), so the halves meet
 * exactly on the seam.
 */
import { archPath } from './arch.js';

const W = 400;
const H = 860;
const n = (v) => Math.round(v * 100) / 100;

export function doorSymbol() {
  const arch = { W, topH: 250, bottom: 790, apex: 96, lobes: 6 };
  const outer = archPath({ ...arch, inset: 40 }).d;
  const inner = archPath({ ...arch, inset: 54 }).d;
  return `
  <linearGradient id="dv-velvet" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#061F17"/>
    <stop offset=".24" stop-color="#11493A"/>
    <stop offset=".46" stop-color="#0C392C"/>
    <stop offset=".5" stop-color="#041510"/>
    <stop offset=".54" stop-color="#0C392C"/>
    <stop offset=".76" stop-color="#11493A"/>
    <stop offset="1" stop-color="#061F17"/>
  </linearGradient>
  <radialGradient id="dv-glow" cx="50%" cy="42%" r="60%">
    <stop offset="0" stop-color="#1E6B53" stop-opacity=".55"/>
    <stop offset="1" stop-color="#1E6B53" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="dv-gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F3DCA0"/><stop offset=".5" stop-color="#C9A45C"/><stop offset="1" stop-color="#9C7638"/>
  </linearGradient>
  <symbol id="door-art" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="url(#dv-velvet)"/>
    <rect width="${W}" height="${H}" fill="url(#dv-glow)"/>
    <!-- embossed arch: shadow, highlight, then a whisper of gold -->
    <g fill="none" stroke-width="2">
      <path d="${outer}" stroke="#03120D" stroke-opacity=".7" transform="translate(0 1.4)"/>
      <path d="${outer}" stroke="#FFFFFF" stroke-opacity=".07" transform="translate(0 -1)"/>
      <path d="${outer}" stroke="url(#dv-gold)" stroke-opacity=".5" stroke-width=".8"/>
      <path d="${inner}" stroke="#03120D" stroke-opacity=".5" stroke-width="1.4" transform="translate(0 1)"/>
      <path d="${inner}" stroke="url(#dv-gold)" stroke-opacity=".28" stroke-width=".6"/>
    </g>
    <!-- fine gold edge around the pair -->
    <rect x="16" y="16" width="${W - 32}" height="${H - 32}" fill="none" stroke="url(#dv-gold)" stroke-opacity=".7" stroke-width="1"/>
    <rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="#C9A45C" stroke-opacity=".3" stroke-width=".6"/>
    <use href="#o-filigree" x="24" y="24" width="46" height="46"/>
    <use href="#o-filigree" x="24" y="24" width="46" height="46" transform="matrix(-1 0 0 1 ${W} 0)"/>
    <use href="#o-filigree" x="24" y="24" width="46" height="46" transform="matrix(1 0 0 -1 0 ${H})"/>
    <use href="#o-filigree" x="24" y="24" width="46" height="46" transform="matrix(-1 0 0 -1 ${W} ${H})"/>
    <!-- seam -->
    <path d="M200 0V${H}" stroke="#020D09" stroke-width="2.2"/>
    <path d="M198.2 0V${H}M201.8 0V${H}" stroke="#2C7A60" stroke-opacity=".35" stroke-width=".6"/>
  </symbol>`;
}

/** Lace-edged ivory seal with an embossed gold rim and the monogram. */
export function seal([a, b]) {
  const cx = 80;
  const cy = 92;
  // scalloped lozenge outline: points on a softened diamond, joined by outward arcs
  const N = 22;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const k = 1 + 0.16 * Math.abs(Math.cos(t)) ** 3; // a little taller at top and bottom
    pts.push([cx + Math.sin(t) * 62, cy - Math.cos(t) * 70 * k]);
  }
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 1; i <= N; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i % N];
    const r = Math.hypot(x1 - x0, y1 - y0) * 0.58;
    d += `A${n(r)} ${n(r)} 0 0 1 ${n(x1)} ${n(y1)}`;
  }
  d += 'Z';
  const mono = (dy, fill, op) =>
    `<g fill="${fill}" fill-opacity="${op}" transform="translate(0 ${dy})">
      <text x="${cx - 24}" y="${cy + 12}" text-anchor="middle" font-family="Cinzel, serif" font-size="34" font-weight="500">${a}</text>
      <text x="${cx + 24}" y="${cy + 12}" text-anchor="middle" font-family="Cinzel, serif" font-size="34" font-weight="500">${b}</text>
    </g>`;
  return `<svg class="doors__seal" viewBox="0 0 160 184" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="ds-paper" cx="45%" cy="38%" r="70%">
        <stop offset="0" stop-color="#FFFBF2"/><stop offset=".7" stop-color="#F4E8D2"/><stop offset="1" stop-color="#E6D5B4"/>
      </radialGradient>
    </defs>
    <path d="${d}" fill="url(#ds-paper)" stroke="#C9A45C" stroke-width="1.1"/>
    <ellipse cx="${cx}" cy="${cy}" rx="49" ry="57" fill="none" stroke="url(#dv-gold)" stroke-width="1.6"/>
    <ellipse cx="${cx}" cy="${cy}" rx="44" ry="52" fill="none" stroke="#B08D57" stroke-width="1.6" stroke-linecap="round" stroke-dasharray=".1 4.2"/>
    <use href="#o-lotus" x="${cx - 11}" y="${cy - 50}" width="22" height="14"/>
    <use href="#o-lotus" x="${cx - 11}" y="${cy + 36}" width="22" height="14" transform="rotate(180 ${cx} ${cy + 43})"/>
    ${mono(0.8, '#FFFFFF', 0.85)}
    ${mono(-0.6, '#5E4419', 0.55)}
    ${mono(0, '#8A6A33', 1)}
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-family="'Pinyon Script', cursive" font-size="24" fill="#C2185B" fill-opacity=".85">&amp;</text>
  </svg>`;
}

export const doorLeaf = (side) =>
  side === 'l'
    ? `<svg class="doors__art" viewBox="0 0 200 ${H}" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false"><use href="#door-art" width="${W}" height="${H}"/></svg>`
    : `<svg class="doors__art" viewBox="200 0 200 ${H}" preserveAspectRatio="xMinYMid slice" aria-hidden="true" focusable="false"><use href="#door-art" width="${W}" height="${H}"/></svg>`;
