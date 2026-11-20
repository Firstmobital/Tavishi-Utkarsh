/**
 * Original illustrated scenes, drawn as inline SVG.
 * Inspired by the décor themes (gold birdcage dome, bougainvillea,
 * emerald lattice, fairy lights, Rajasthani palace), not traced from any
 * photo, so the real venue stays a surprise.
 *
 * Randomness is seeded, so the markup is identical on every build.
 */
import { C, cluster, leaf, rose as roseUse } from './ornaments.js';
import { archPath } from './arch.js';

const f = (n) => (Math.round(n * 10) / 10).toString();

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GOLD_STOPS = `<stop offset="0" stop-color="#F7E4B0"/><stop offset=".5" stop-color="#D4B06A"/><stop offset="1" stop-color="#A8823F"/>`;

/* ---------- small primitives ---------- */

function cubicPt(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function quadPt([x0, y0], [cx, cy], [x1, y1], t) {
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
}

/** White / blush garden rose. */
const rose = (x, y, r, fill = '#FBF1EC') => roseUse(x, y, r, fill !== '#FBF1EC');

/** A mass of bougainvillea: leaves + bract clusters scattered in an ellipse. */
function bush(rand, cx, cy, rx, ry, n, s = 1, opts = {}) {
  const { roses = 0, dark = false } = opts;
  let leaves = '';
  let flowers = '';
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand());
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    leaves += leaf([x, y, rand() * 360, s * (0.7 + rand() * 0.5), rand() < 0.5 ? C.leaf : dark ? '#1C4A38' : C.leaf2]);
    if (rand() < 0.75) {
      const ax = cx + Math.cos(a + 0.6) * rx * Math.sqrt(rand());
      const ay = cy + Math.sin(a + 0.6) * ry * Math.sqrt(rand());
      flowers += cluster([ax, ay, rand() * 120, s * (0.55 + rand() * 0.45), Math.floor(rand() * 3)]);
    }
  }
  for (let i = 0; i < roses; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 0.85;
    flowers += rose(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, s * (3 + rand() * 2.5), rand() < 0.5 ? '#FBF1EC' : '#F6D3DA');
  }
  return leaves + flowers;
}

/** Catenary-ish string of fairy lights. */
function fairyLights(p0, p1, sag, step = 11, r = 1.5) {
  const ctrl = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + sag * 2];
  const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + sag;
  const n = Math.max(3, Math.round(len / step));
  let dots = '';
  for (let i = 1; i < n; i++) {
    const [x, y] = quadPt(p0, ctrl, p1, i / n);
    dots += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 2.8)}" fill="#FFD27A" fill-opacity=".2"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#FFF3CC"/>`;
  }
  return `<path d="M${f(p0[0])} ${f(p0[1])}Q${f(ctrl[0])} ${f(ctrl[1])} ${f(p1[0])} ${f(p1[1])}" fill="none" stroke="#C9A45C" stroke-opacity=".55" stroke-width=".7"/>${dots}`;
}

/** Hanging flower strand (pink bracts + white jasmine buds). */
function strand(rand, x, y0, len, s = 1) {
  let out = `<path d="M${f(x)} ${f(y0)}V${f(y0 + len)}" stroke="#7A5A26" stroke-opacity=".6" stroke-width="${f(0.6 * s)}"/>`;
  for (let y = y0 + 5 * s; y < y0 + len; y += 6.5 * s) {
    out +=
      rand() < 0.55
        ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(2.3 * s)}" fill="${[C.rose, C.rose2, C.pink][Math.floor(rand() * 3)]}"/>`
        : `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(1.6 * s)}" ry="${f(2.4 * s)}" fill="#FFF8EC"/>`;
  }
  return out;
}

/** Onion dome path sitting on (cx, baseY). */
const onion = (cx, baseY, w, h) =>
  `M${f(cx - w / 2)} ${f(baseY)}C${f(cx - w * 0.62)} ${f(baseY - h * 0.45)} ${f(cx - w * 0.1)} ${f(baseY - h * 0.68)} ${f(cx)} ${f(baseY - h)}C${f(cx + w * 0.1)} ${f(baseY - h * 0.68)} ${f(cx + w * 0.62)} ${f(baseY - h * 0.45)} ${f(cx + w / 2)} ${f(baseY)}Z`;

/** Small domed pavilion (chhatri) silhouette. */
function chhatri(cx, baseY, w, fill, lit = '') {
  const ph = w * 0.62;
  const top = baseY - ph;
  let s = '';
  if (lit) s += `<rect x="${f(cx - w * 0.42)}" y="${f(top)}" width="${f(w * 0.84)}" height="${f(ph)}" fill="${lit}" fill-opacity=".55"/>`;
  for (let i = 0; i < 4; i++) {
    const x = cx - w * 0.46 + i * w * 0.3;
    s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w * 0.08)}" height="${f(ph)}" fill="${fill}"/>`;
  }
  s += `<rect x="${f(cx - w * 0.6)}" y="${f(top - w * 0.1)}" width="${f(w * 1.2)}" height="${f(w * 0.12)}" fill="${fill}"/>`;
  s += `<path d="${onion(cx, top - w * 0.08, w * 0.9, w * 0.78)}" fill="${fill}"/>`;
  s += `<path d="M${f(cx)} ${f(top - w * 0.84)}v${f(-w * 0.18)}" stroke="${fill}" stroke-width="${f(w * 0.05)}"/>`;
  return s;
}

/** Arched window lit from within. */
const archWindow = (x, y, w, h, fill, op = 0.85) =>
  `<path d="M${f(x)} ${f(y + h)}V${f(y + w / 2)}A${f(w / 2)} ${f(w / 2)} 0 0 1 ${f(x + w)} ${f(y + w / 2)}V${f(y + h)}Z" fill="${fill}" fill-opacity="${op}"/>`;

/* ---------- gold birdcage dome ---------- */
/**
 * @param {object} o  cx, baseY, R, sideTop, apexY, ribs, s (flower scale),
 *                    seed, glow, density
 */
function birdcage(o) {
  const { cx, baseY, R, sideTop, apexY, ribs = 11, s = 1, seed = 7, glow = true, density = 1, id = 'bc' } = o;
  const fs = o.fs ?? s; // flower scale
  const tunnel = o.tunnel ?? true;
  const rand = rng(seed);
  const rise = sideTop - apexY;
  const ribPts = (bx) => {
    const top = cx + (bx - cx) * 0.97;
    return [
      [top, sideTop],
      [top, sideTop - rise * 0.56],
      [cx + (bx - cx) * 0.5, apexY + rise * 0.04],
      [cx, apexY],
    ];
  };
  const ribPath = (bx) => {
    const [p0, p1, p2, p3] = ribPts(bx);
    return `M${f(bx)} ${f(baseY)}L${f(p0[0])} ${f(p0[1])}C${f(p1[0])} ${f(p1[1])} ${f(p2[0])} ${f(p2[1])} ${f(p3[0])} ${f(p3[1])}`;
  };

  let out = `<defs>
    <linearGradient id="${id}-gold" gradientUnits="userSpaceOnUse" x1="0" y1="${apexY}" x2="0" y2="${baseY}">${GOLD_STOPS}</linearGradient>
    <radialGradient id="${id}-glow" cx="50%" cy="55%" r="50%"><stop offset="0" stop-color="#FFE2A8" stop-opacity=".75"/><stop offset=".6" stop-color="#F3B98A" stop-opacity=".25"/><stop offset="1" stop-color="#F3B98A" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}-tunnel" cx="50%" cy="70%" r="65%"><stop offset="0" stop-color="#F6C98A" stop-opacity=".9"/><stop offset=".55" stop-color="#7A3550"/><stop offset="1" stop-color="#2A1424"/></radialGradient>
  </defs>`;

  if (glow) {
    out += `<ellipse cx="${f(cx)}" cy="${f((sideTop + baseY) / 2)}" rx="${f(R * 1.25)}" ry="${f((baseY - apexY) * 0.62)}" fill="url(#${id}-glow)"/>`;
  }

  // inner floral archway (gives depth)
  const aw = R * 0.38;
  const aTop = sideTop + (baseY - sideTop) * 0.26;
  if (tunnel) out += `<path d="M${f(cx - aw)} ${f(baseY - 4 * s)}V${f(aTop)}A${f(aw)} ${f(aw * 1.1)} 0 0 1 ${f(cx + aw)} ${f(aTop)}V${f(baseY - 4 * s)}Z" fill="url(#${id}-tunnel)"/>`;
  let arch = '';
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI + (i / 14) * Math.PI;
    arch += cluster([cx + Math.cos(a) * aw, aTop + Math.sin(a) * aw * 1.1, rand() * 120, fs * 0.5, Math.floor(rand() * 3)]);
  }
  for (let y = aTop; y < baseY - 6; y += 9 * fs) {
    arch += cluster([cx - aw, y, rand() * 120, fs * 0.5, Math.floor(rand() * 3)]);
    arch += cluster([cx + aw, y, rand() * 120, fs * 0.5, Math.floor(rand() * 3)]);
  }
  out += arch;

  // floor
  out += `<ellipse cx="${f(cx)}" cy="${f(baseY)}" rx="${f(R * 1.12)}" ry="${f(R * 0.17)}" fill="#FFD98E" fill-opacity=".25"/>`;
  out += `<ellipse cx="${f(cx)}" cy="${f(baseY)}" rx="${f(R * 1.04)}" ry="${f(R * 0.14)}" fill="#F6E6DE" stroke="#F8D88F" stroke-width="${f(2.2 * s)}"/>`;

  // ribs + rings
  let cage = '';
  for (let i = 0; i < ribs; i++) {
    const th = -Math.PI / 2 + (i / (ribs - 1)) * Math.PI;
    const bx = cx + R * Math.sin(th);
    const outer = i === 0 || i === ribs - 1;
    cage += `<path d="${ribPath(bx)}" stroke-width="${f((outer ? 2.6 : 1.1) * s)}"${outer ? '' : ' stroke-opacity=".85"'}/>`;
  }
  const ring = (y, rx) =>
    `<ellipse cx="${f(cx)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * 0.13)}" stroke-width="${f(1.1 * s)}"/>`;
  cage += ring(sideTop, R * 0.97) + ring((sideTop + baseY) / 2, R * 0.985);
  cage += ring(sideTop - rise * 0.42, R * 0.82) + ring(sideTop - rise * 0.75, R * 0.5);
  out += `<g fill="none" stroke="url(#${id}-gold)" stroke-linecap="round">${cage}</g>`;

  // chandelier
  const chY = sideTop - rise * 0.05;
  out += `<path d="M${f(cx)} ${f(apexY + 6)}V${f(chY - 14 * s)}" stroke="#E8CF9A" stroke-width="${f(0.8 * s)}"/>`;
  out += `<g transform="translate(${f(cx)} ${f(chY)}) scale(${f(s)})">
    <path d="M-14 -10Q0 -2 14 -10M-10 -2Q0 6 10 -2M-6 6Q0 12 6 6" fill="none" stroke="#E8CF9A" stroke-width="1.2"/>
    <path d="M0 -16L4 -10 0 16 -4 -10Z" fill="#F7E4B0" fill-opacity=".8"/>
    ${[-14, -7, 0, 7, 14].map((x) => `<circle cx="${x}" cy="${x === 0 ? -12 : -10 + Math.abs(x) * 0.1}" r="3.2" fill="#FFD27A" fill-opacity=".3"/><circle cx="${x}" cy="${x === 0 ? -12 : -10 + Math.abs(x) * 0.1}" r="1.3" fill="#FFF3CC"/>`).join('')}
  </g>`;

  // flowers on the cage: thick at the crown, along the outer ribs and base
  let fl = '';
  const outerL = ribPts(cx - R);
  const outerR = ribPts(cx + R);
  const along = Math.round(40 * density);
  for (let i = 0; i <= along; i++) {
    const t = i / along;
    for (const P of [outerL, outerR]) {
      const [x, y] = cubicPt(...P, t);
      fl += leaf([x + (rand() - 0.5) * 10 * fs, y + (rand() - 0.5) * 10 * fs, rand() * 360, fs * 0.7, rand() < 0.5 ? C.leaf : C.leaf2]);
      fl += cluster([x + (rand() - 0.5) * 8 * fs, y + (rand() - 0.5) * 8 * fs, rand() * 120, fs * (0.6 + rand() * 0.4), Math.floor(rand() * 3)]);
    }
  }
  // dome cap: scattered blooms between the top rings
  const capN = Math.round(110 * density);
  for (let i = 0; i < capN; i++) {
    const t = rand();
    const yy = apexY + rise * (0.08 + t * 0.55);
    const half = R * (0.25 + t * 0.62);
    const x = cx + (rand() * 2 - 1) * half;
    fl += rand() < 0.3
      ? leaf([x, yy, rand() * 360, fs * 0.6, C.leaf2])
      : cluster([x, yy, rand() * 120, fs * (0.5 + rand() * 0.4), Math.floor(rand() * 3)]);
  }
  // crown
  fl += bush(rand, cx, apexY + 6 * fs, 26 * fs, 14 * fs, Math.round(22 * density), fs * 0.8, { roses: 5 });
  // base beds
  fl += bush(rand, cx - R * 0.95, baseY - 12 * fs, 34 * fs, 26 * fs, Math.round(22 * density), fs * 0.85, { roses: 6 });
  fl += bush(rand, cx + R * 0.95, baseY - 12 * fs, 34 * fs, 26 * fs, Math.round(22 * density), fs * 0.85, { roses: 6 });
  out += fl;
  return out;
}

/* ---------- HERO: night garden with palace and birdcage dome ---------- */
export function heroScene() {
  const rand = rng(2027);
  const W = 600;
  const H = 520;
  const horizon = 322;
  const P = '#4A2140';
  const LIT = '#F6C47A';

  let palace = '';
  // towers
  for (const x of [40, 534]) {
    palace += `<rect x="${x}" y="250" width="26" height="72" fill="${P}"/><path d="${onion(x + 13, 250, 30, 30)}" fill="${P}"/>`;
    palace += archWindow(x + 9, 268, 8, 13, LIT, 0.8) + archWindow(x + 9, 292, 8, 13, LIT, 0.6);
  }
  // wings
  for (const [x, cs] of [
    [66, [95, 150]],
    [424, [450, 505]],
  ]) {
    palace += `<rect x="${x}" y="270" width="110" height="52" fill="${P}"/>`;
    for (let i = 0; i < 110; i += 9) palace += `<rect x="${x + i}" y="265" width="5" height="6" fill="${P}"/>`;
    for (const c of cs) palace += chhatri(c, 266, 22, P, LIT);
    for (let i = 8; i < 104; i += 16) palace += archWindow(x + i, 286, 7, 13, LIT, 0.45 + rand() * 0.5);
  }
  // main block
  palace += `<rect x="176" y="240" width="248" height="82" fill="${P}"/>`;
  for (let i = 0; i < 248; i += 9) palace += `<rect x="${176 + i}" y="235" width="5" height="6" fill="${P}"/>`;
  palace += chhatri(200, 236, 26, P, LIT) + chhatri(400, 236, 26, P, LIT) + chhatri(300, 236, 58, P, LIT);
  for (const y of [256, 284]) {
    for (let x = 186; x < 414; x += 18) palace += archWindow(x, y, 7, 13, LIT, 0.4 + rand() * 0.55);
  }

  // tree line
  let trees = '';
  for (let x = -10; x < W + 20; x += 14 + rand() * 12) {
    const r = 9 + rand() * 11;
    trees += `<circle cx="${f(x)}" cy="${f(horizon - r * 0.35)}" r="${f(r)}"/>`;
  }
  for (const x of [22, 120, 168, 432, 480, 578]) {
    trees += `<ellipse cx="${x}" cy="${horizon - 24}" rx="6.5" ry="${f(24 + rand() * 8)}"/>`;
  }

  const lights =
    fairyLights([-10, 70], [W + 10, 52], 34, 12) +
    fairyLights([-10, 132], [W + 10, 118], 26, 13, 1.3) +
    fairyLights([60, 200], [540, 196], 18, 14, 1.1);

  const dome = birdcage({ cx: 300, baseY: 468, R: 150, sideTop: 300, apexY: 112, ribs: 13, s: 1.15, fs: 0.62, seed: 11, density: 0.95, id: 'hero' });

  const fg =
    bush(rand, 40, 494, 84, 48, 54, 0.74, { roses: 10 }) +
    bush(rand, 560, 494, 84, 48, 54, 0.74, { roses: 10 }) +
    bush(rand, 140, 514, 70, 20, 22, 0.66, { roses: 6 }) +
    bush(rand, 460, 514, 70, 20, 22, 0.66, { roses: 6 });

  return `<svg class="hero__scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3A1D33" stop-opacity="0"/>
        <stop offset=".3" stop-color="#5E2843" stop-opacity=".7"/>
        <stop offset=".52" stop-color="#A6475F"/>
        <stop offset=".62" stop-color="#E39A8A"/>
        <stop offset=".64" stop-color="#F2BE98"/>
      </linearGradient>
      <linearGradient id="hs-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1E3A2E"/><stop offset="1" stop-color="#0D1F18"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${horizon + 2}" fill="url(#hs-sky)"/>
    <g>${palace}</g>
    <g fill="#163A2E">${trees}</g>
    <rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#hs-ground)"/>
    ${lights}
    ${dome}
    ${fg}
  </svg>`;
}

/* ---------- EVENT VIGNETTES (viewBox 200 x 120) ---------- */
function vignetteDome() {
  const rand = rng(41);
  return (
    fairyLights([-6, 18], [206, 14], 14, 10, 1.1) +
    birdcage({ cx: 100, baseY: 108, R: 44, sideTop: 72, apexY: 18, ribs: 9, s: 0.5, fs: 0.3, seed: 5, glow: true, tunnel: false, density: 0.42, id: 'vd' }) +
    bush(rand, 20, 106, 22, 10, 14, 0.38, { roses: 4 }) +
    bush(rand, 180, 106, 22, 10, 14, 0.38, { roses: 4 })
  );
}

function vignetteMandap() {
  const rand = rng(77);
  const canopy = archPath({ W: 112, topH: 30, bottom: 32, lobes: 4, closed: true }).d;
  let s = `<defs>
    <linearGradient id="vm-gold" x1="0" y1="0" x2="0" y2="1">${GOLD_STOPS}</linearGradient>
    <radialGradient id="vm-fire" cx="50%" cy="80%" r="70%"><stop offset="0" stop-color="#FFE6A0"/><stop offset=".5" stop-color="#F29B38"/><stop offset="1" stop-color="#D9467E"/></radialGradient>
    <radialGradient id="vm-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD98E" stop-opacity=".7"/><stop offset="1" stop-color="#FFD98E" stop-opacity="0"/></radialGradient>
  </defs>`;
  s += `<ellipse cx="100" cy="90" rx="46" ry="26" fill="url(#vm-glow)"/>`;
  // platform
  s += `<rect x="26" y="104" width="148" height="8" rx="1.5" fill="#F3D9DC" stroke="#B08D57" stroke-width=".8"/><rect x="36" y="99" width="128" height="6" fill="#FBF5EE" stroke="#B08D57" stroke-width=".8"/>`;
  // canopy
  s += `<g transform="translate(44 12)"><path d="${canopy}" fill="#F8E3E3" stroke="#B08D57" stroke-width="1"/></g>`;
  s += `<rect x="36" y="42" width="128" height="7" rx="1" fill="url(#vm-gold)"/>`;
  // kalash on the apex
  s += `<g transform="translate(100 25)"><path d="M-5 0Q-7 -5 -3 -7H3Q7 -5 5 0Z" fill="url(#vm-gold)"/><path d="M0 -7L-5 -13M0 -7L5 -13M0 -7V-14" stroke="#2F6B4E" stroke-width="1.4" stroke-linecap="round"/><circle cy="-15" r="2.2" fill="#C9A45C"/></g>`;
  // pillars
  for (const x of [42, 150]) {
    s += `<rect x="${x}" y="49" width="8" height="50" fill="#FBF5EE" stroke="#B08D57" stroke-width=".9"/><rect x="${x - 2}" y="49" width="12" height="4" fill="url(#vm-gold)"/><rect x="${x - 2}" y="95" width="12" height="4" fill="url(#vm-gold)"/><path d="M${x + 4} 56V92" stroke="#C9A45C" stroke-width=".6" stroke-dasharray="2 2"/>`;
  }
  // garland swag
  const p0 = [50, 52];
  const p1 = [150, 52];
  const ctrl = [100, 76];
  s += `<path d="M50 52Q100 76 150 52" fill="none" stroke="#7A5A26" stroke-opacity=".5" stroke-width=".6"/>`;
  for (let i = 1; i < 12; i++) {
    const [x, y] = quadPt(p0, ctrl, p1, i / 12);
    s += cluster([x, y, rand() * 120, 0.32, i % 3]);
  }
  for (const x of [46, 154]) s += strand(rand, x, 50, 36, 0.7);
  // agni kund + flame
  s += `<path d="M84 99L88 90H112L116 99Z" fill="url(#vm-gold)" stroke="#A8823F" stroke-width=".6"/>`;
  s += `<path d="M100 66C107 74 110 80 106 88C104 91 96 91 94 88C90 80 94 74 100 66Z" fill="url(#vm-fire)"/>`;
  s += `<path d="M93 76C96 80 97 84 95 89M107 76C104 80 103 84 105 89" stroke="#F29B38" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/>`;
  // flowers at pillar bases
  s += bush(rand, 40, 99, 14, 6, 9, 0.36, { roses: 3 }) + bush(rand, 160, 99, 14, 6, 9, 0.36, { roses: 3 });
  return s;
}

function lantern(x, y, s, rand) {
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">
    <path d="M0 -60V0" stroke="#B08D57" stroke-width=".8"/>
    <path d="M-5 4Q0 -3 5 4Z" fill="#C9A45C"/>
    <path d="M-6 4H6L9 12 6 30H-6L-9 12Z" fill="#B08D57"/>
    <path d="M-3.6 7H3.6L5.6 13 3.6 27H-3.6L-5.6 13Z" fill="#FFD98E"/>
    <path d="M0 7V27M-5 13H5" stroke="#B08D57" stroke-width=".6"/>
    <path d="M-6 30H6L0 37Z" fill="#C9A45C"/>
    <path d="M0 37V43" stroke="${rand() < 0.5 ? C.rose : C.rose2}" stroke-width="1.6"/>
    <circle cy="17" r="13" fill="#FFD27A" fill-opacity=".18"/>
  </g>`;
}

function vignetteLanterns() {
  const rand = rng(91);
  let s = '';
  // crescent moon + sparkles
  s += `<path d="M156 14A18 18 0 1 0 172 44A14 14 0 1 1 156 14Z" fill="#E8CF9A"/>`;
  for (const [x, y, r] of [
    [128, 20, 3],
    [184, 62, 2.4],
    [140, 46, 1.8],
    [28, 30, 2.2],
  ]) {
    s += `<path d="M${x} ${y - r * 2}Q${x} ${y} ${x + r * 2} ${y}Q${x} ${y} ${x} ${y + r * 2}Q${x} ${y} ${x - r * 2} ${y}Q${x} ${y} ${x} ${y - r * 2}Z" fill="#C9A45C"/>`;
  }
  s += lantern(52, 30, 0.9, rand) + lantern(82, 44, 1.0, rand) + lantern(112, 26, 0.85, rand);
  // row of diyas
  for (let i = 0; i < 7; i++) {
    const x = 34 + i * 22;
    s += `<g transform="translate(${x} 108)"><path d="M-7 0Q0 7 7 0Z" fill="#B08D57"/><path d="M0 -1C3 -4 2 -8 0 -11C-2 -8 -3 -4 0 -1Z" fill="#F29B38"/><circle cy="-5" r="6" fill="#FFD27A" fill-opacity=".22"/></g>`;
  }
  s += bush(rand, 14, 106, 14, 9, 9, 0.36, { roses: 3 }) + bush(rand, 188, 106, 14, 9, 9, 0.36, { roses: 3 });
  return s;
}

const VIGNETTES = { dome: vignetteDome, mandap: vignetteMandap, lanterns: vignetteLanterns };

export function eventArt(kind) {
  const fn = VIGNETTES[kind] || vignetteDome;
  return `<svg class="event__art" viewBox="0 0 200 120" aria-hidden="true" focusable="false">${fn()}</svg>`;
}

/* ---------- SETTING: gold pergola with emerald lattice, at night ---------- */
export function settingScene() {
  const rand = rng(303);
  const W = 400;
  const H = 280;
  const panel = archPath({ W: 100, topH: 40, bottom: 150, lobes: 4, apex: 6, closed: true }).d;
  let s = `<defs>
    <linearGradient id="ss-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B2620"/><stop offset=".7" stop-color="#173F31"/><stop offset="1" stop-color="#0E2A22"/></linearGradient>
    <linearGradient id="ss-gold" x1="0" y1="0" x2="0" y2="1">${GOLD_STOPS}</linearGradient>
    <pattern id="ss-lattice" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="12" height="12" fill="#14382C"/><path d="M0 0H12M0 0V12" stroke="#3E8062" stroke-width="1.6"/>
    </pattern>
    <radialGradient id="ss-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD98E" stop-opacity=".55"/><stop offset="1" stop-color="#FFD98E" stop-opacity="0"/></radialGradient>
  </defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#ss-bg)"/>`;
  for (let i = 0; i < 26; i++) {
    s += `<circle cx="${f(rand() * W)}" cy="${f(rand() * 70)}" r="${f(0.5 + rand() * 0.9)}" fill="#FFF3CC" fill-opacity="${f(0.4 + rand() * 0.5)}"/>`;
  }
  s += `<ellipse cx="200" cy="246" rx="210" ry="40" fill="url(#ss-glow)"/>`;
  // three lattice arches
  for (const x of [42, 150, 258]) {
    s += `<g transform="translate(${x} 82)"><path d="${panel}" fill="url(#ss-lattice)" stroke="url(#ss-gold)" stroke-width="2"/></g>`;
  }
  // floor
  s += `<rect x="0" y="232" width="${W}" height="${H - 232}" fill="#0E2A22"/><path d="M0 232H400" stroke="#C9A45C" stroke-opacity=".6"/>`;
  // posts + beams
  for (const x of [28, 140, 252, 364]) {
    s += `<rect x="${x}" y="64" width="8" height="168" fill="url(#ss-gold)"/><rect x="${x - 3}" y="226" width="14" height="6" fill="#C9A45C"/>`;
  }
  s += `<rect x="10" y="56" width="380" height="9" fill="url(#ss-gold)"/><rect x="18" y="48" width="364" height="4" fill="#C9A45C"/>`;
  for (let x = 24; x < 380; x += 22) s += `<path d="M${x} 65q11 9 22 0" fill="none" stroke="#C9A45C" stroke-width="1.2"/>`;
  // fairy lights
  s += fairyLights([10, 70], [140, 70], 10, 11) + fairyLights([140, 70], [252, 70], 10, 11) + fairyLights([252, 70], [390, 70], 10, 11);
  // hanging strands
  for (let x = 54; x < 360; x += 15) {
    if (Math.abs(x - 144) < 10 || Math.abs(x - 256) < 10) continue;
    s += strand(rand, x, 66, 20 + rand() * 36, 0.85);
  }
  // bougainvillea on the beam and posts
  s += bush(rand, 60, 52, 64, 14, 30, 0.5, { roses: 4 }) + bush(rand, 200, 50, 74, 13, 32, 0.5, { roses: 4 }) + bush(rand, 340, 52, 64, 14, 30, 0.5, { roses: 4 });
  s += bush(rand, 32, 140, 14, 84, 26, 0.48, { dark: true }) + bush(rand, 368, 140, 14, 84, 26, 0.48, { dark: true });
  // lanterns on the floor + flower beds
  s += lantern(96, 210, 0.7, rand) + lantern(304, 210, 0.7, rand);
  s += bush(rand, 40, 236, 54, 16, 22, 0.52, { roses: 10 }) + bush(rand, 360, 236, 54, 16, 22, 0.52, { roses: 10 });
  s += bush(rand, 200, 240, 64, 10, 18, 0.48, { roses: 10 });
  return `<svg class="setting__art" viewBox="0 0 ${W} ${H}" role="img" aria-label="Illustration of a gold pergola with emerald lattice, bougainvillea and fairy lights at night" focusable="false">${s}</svg>`;
}

/* ---------- CLOSING: line-art gazebo in blush and gold ---------- */
export function gazeboScene() {
  const rand = rng(515);
  const W = 400;
  const H = 300;
  let s = `<defs>
    <linearGradient id="gz-gold" x1="0" y1="0" x2="0" y2="1">${GOLD_STOPS}</linearGradient>
    <radialGradient id="gz-glow" cx="50%" cy="55%" r="55%"><stop offset="0" stop-color="#F3D9DC"/><stop offset="1" stop-color="#F3D9DC" stop-opacity="0"/></radialGradient>
  </defs>`;
  s += `<ellipse cx="200" cy="170" rx="210" ry="140" fill="url(#gz-glow)"/>`;
  s += fairyLights([200, 40], [-10, 120], 24, 12, 1.3) + fairyLights([200, 40], [410, 120], 24, 12, 1.3);
  // steps
  s += `<rect x="78" y="262" width="244" height="10" rx="2" fill="#FBF5EE" stroke="#B08D57"/><rect x="92" y="254" width="216" height="9" fill="#F8E7E8" stroke="#B08D57"/>`;
  // dome + eave
  s += `<path d="${onion(200, 132, 150, 100)}" fill="#F9E9E9" stroke="url(#gz-gold)" stroke-width="2"/>`;
  s += `<path d="${onion(200, 132, 104, 72)}" fill="none" stroke="#C9A45C" stroke-opacity=".6"/>`;
  s += `<path d="M200 32V18" stroke="#B08D57" stroke-width="2"/><circle cx="200" cy="15" r="3.5" fill="#C9A45C"/>`;
  s += `<path d="M86 142Q200 126 314 142L322 132H78Z" fill="url(#gz-gold)"/>`;
  s += chhatri(92, 128, 26, '#C9A45C') + chhatri(308, 128, 26, '#C9A45C');
  // cusped arches between pillars
  const xs = [100, 162, 238, 300];
  for (let i = 0; i < xs.length - 1; i++) {
    const w = xs[i + 1] - xs[i] - 10;
    const d = archPath({ W: w, topH: 34, bottom: 108, lobes: 3, apex: 6 }).d;
    s += `<g transform="translate(${xs[i] + 10} 146)"><path d="${d}" fill="#FFFDF9" fill-opacity=".7" stroke="#B08D57" stroke-width="1.2"/></g>`;
  }
  for (const x of xs) {
    s += `<rect x="${x}" y="142" width="10" height="112" fill="#FBF5EE" stroke="url(#gz-gold)" stroke-width="1.4"/><rect x="${x - 2}" y="142" width="14" height="5" fill="#C9A45C"/><rect x="${x - 2}" y="249" width="14" height="5" fill="#C9A45C"/>`;
  }
  // florals: draped on the eave, climbing outer pillars, beds at the base
  s += bush(rand, 120, 138, 42, 8, 17, 0.46, { roses: 3 }) + bush(rand, 280, 138, 42, 8, 17, 0.46, { roses: 3 });
  s += bush(rand, 104, 196, 9, 56, 17, 0.44) + bush(rand, 306, 196, 9, 56, 17, 0.44);
  s += bush(rand, 50, 254, 58, 26, 35, 0.6, { roses: 14 }) + bush(rand, 350, 254, 58, 26, 35, 0.6, { roses: 14 });
  return `<svg class="closing__art" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${s}</svg>`;
}
