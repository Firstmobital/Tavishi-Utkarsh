/**
 * Generates derived image assets into public/ (outputs are committed):
 *   - responsive image variants (venue *-900.webp, couple *-800.webp)
 *   - portrait hero crops of the floral dome + blurred desktop backdrop
 *   - og-image.jpg (1200x630 social / WhatsApp preview)
 *   - favicon.svg monogram + apple-touch-icon.png
 *
 * Run with:  npm run generate:assets
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { archPath } from '../src/lib/arch.js';
import { content } from '../src/content.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (...p) => path.join(root, 'public', ...p);

const GOLD = '#C9A45C';
const GOLD_LIGHT = '#E8CF9A';
const IVORY = '#FBF5EE';
const BLUSH = '#F3D9DC';

const loadFont = async (file) =>
  opentype.parse((await readFile(path.join(root, 'scripts/fonts', file))).buffer);

/* ---------- responsive variants ---------- */
async function variants() {
  // 480w for phones, 800/900w for high-DPR screens (paired via srcset in render.js)
  const jobs = [
    ['venue', [480, 900]],
    ['couple', [480, 800]],
  ];
  for (const [dir, widths] of jobs) {
    const files = (await readdir(pub('images', dir))).filter(
      (f) => f.endsWith('.webp') && !/-(480|800|900)\.webp$/.test(f) && !/-(hero|blur)/.test(f),
    );
    for (const f of files) {
      for (const width of widths) {
        const out = pub('images', dir, f.replace('.webp', `-${width}.webp`));
        await sharp(pub('images', dir, f)).resize({ width }).webp({ quality: 72 }).toFile(out);
      }
    }
  }
}

/* ---------- hero crops + backdrop ---------- */
async function hero() {
  const src = pub('images/venue/floral-dome.webp');
  const { width, height } = await sharp(src).metadata();
  const cropW = Math.round(height * 0.72);
  const left = Math.round((width - cropW) / 2);
  const crop = sharp(src).extract({ left, top: 0, width: cropW, height });
  const buf = await crop.toBuffer();
  for (const w of [480, 720]) {
    await sharp(buf)
      .resize({ width: w })
      .webp({ quality: 70 })
      .toFile(pub(`images/venue/floral-dome-hero-${w}.webp`));
  }
  await sharp(src)
    .resize({ width: 480 })
    .blur(14)
    .modulate({ brightness: 0.9 })
    .webp({ quality: 55 })
    .toFile(pub('images/venue/floral-dome-blur.webp'));
}

/* ---------- text helpers ---------- */
function textPath(font, text, cx, baseline, size, fill, letterSpacing = 0) {
  const chars = [...text];
  const glyphW = font.getAdvanceWidth(text, size);
  const total = glyphW + letterSpacing * (chars.length - 1);
  let x = cx - total / 2;
  if (!letterSpacing) {
    return `<path fill="${fill}" d="${font.getPath(text, x, baseline, size).toPathData(2)}"/>`;
  }
  let d = '';
  for (const ch of chars) {
    // one <path> per glyph: some glyph outlines don't close their last
    // contour, which breaks rendering when concatenated
    const glyph = font.getPath(ch, x, baseline, size).toPathData(2);
    if (glyph) d += `<path d="${glyph}"/>`;
    x += font.getAdvanceWidth(ch, size) + letterSpacing;
  }
  return `<g fill="${fill}">${d}</g>`;
}

function divider(cx, y, w, color) {
  const h = w / 2;
  return `<g stroke="${color}" stroke-width="1.4" fill="none">
    <line x1="${cx - h}" y1="${y}" x2="${cx - 14}" y2="${y}"/>
    <line x1="${cx + 14}" y1="${y}" x2="${cx + h}" y2="${y}"/>
    <path d="M${cx} ${y - 8} L${cx + 8} ${y} L${cx} ${y + 8} L${cx - 8} ${y} Z" fill="${color}"/>
    <circle cx="${cx - h}" cy="${y}" r="2.2" fill="${color}"/>
    <circle cx="${cx + h}" cy="${y}" r="2.2" fill="${color}"/>
  </g>`;
}

/* ---------- OG image ---------- */
async function ogImage(script, caps) {
  const W = 1200;
  const H = 630;
  const photoSrc = pub('images/couple/couple-arch.webp');

  const bg = await sharp(photoSrc)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .blur(28)
    .toBuffer();

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0F3D2E" stop-opacity=".9"/>
        <stop offset=".5" stop-color="#2A1715" stop-opacity=".82"/>
        <stop offset="1" stop-color="#4A1F2E" stop-opacity=".9"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
  </svg>`;

  // Arch-framed photo in the centre
  const pw = 330;
  const ph = 500;
  const px = (W - pw) / 2;
  const py = 70;
  const s = pw / 300;
  const archH = ph / s;
  const clip = archPath({ W: 300, topH: 124, bottom: archH, closed: true, sx: s, sy: s }).d;
  const photo = await sharp(photoSrc).resize(pw, ph, { fit: 'cover', position: 'centre' }).toBuffer();
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><path d="${clip}" fill="#fff"/></svg>`,
  );
  const archPhoto = await sharp(photo).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

  const outer = archPath({ W: 300, topH: 124, bottom: archH, sx: s, sy: s }).d;
  const inner = archPath({ W: 300, topH: 124, bottom: archH - 7, inset: 7, sx: s, sy: s }).d;
  const leftCx = px / 2;
  const rightCx = W - px / 2;
  const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <g transform="translate(${px} ${py})" fill="none">
      <path d="${outer}" stroke="${GOLD}" stroke-width="5" transform="translate(0 0)"/>
      <path d="${inner}" stroke="${GOLD_LIGHT}" stroke-width="1.6" stroke-opacity=".9"/>
      <rect x="-5" y="${ph - 2}" width="${pw + 10}" height="0" />
    </g>
    <line x1="${px - 2.5}" y1="${py + ph}" x2="${px + pw + 2.5}" y2="${py + ph}" stroke="${GOLD}" stroke-width="5"/>
    ${textPath(caps, 'THE BRIDE', leftCx, 228, 20, BLUSH, 5)}
    ${textPath(script, content.couple.bride, leftCx, 330, 104, GOLD_LIGHT)}
    ${divider(leftCx, 378, 220, GOLD)}
    ${textPath(caps, '15 – 16 JANUARY 2027', leftCx, 428, 21, IVORY, 2.5)}
    ${textPath(caps, 'THE GROOM', rightCx, 228, 20, BLUSH, 5)}
    ${textPath(script, content.couple.groom, rightCx, 330, 104, GOLD_LIGHT)}
    ${divider(rightCx, 378, 220, GOLD)}
    ${textPath(caps, 'JAIPUR · RAJASTHAN', rightCx, 428, 21, IVORY, 2.5)}
  </svg>`;

  await sharp(bg)
    .composite([
      { input: Buffer.from(overlay) },
      { input: archPhoto, left: px, top: py },
      { input: Buffer.from(text) },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(pub('og-image.jpg'));
}

/* ---------- favicon ---------- */
async function favicon(script, caps) {
  const S = 64;
  // Lay out "T & U" centred: capitals in Cinzel, ampersand smaller
  const big = 25;
  const small = 15;
  const gap = 1.5;
  const wT = caps.getAdvanceWidth('T', big);
  const wA = caps.getAdvanceWidth('&', small);
  const wU = caps.getAdvanceWidth('U', big);
  let x = (S - (wT + wA + wU + gap * 2)) / 2;
  const T = caps.getPath('T', x, 41, big).toPathData(2);
  x += wT + gap;
  const amp = caps.getPath('&', x, 40, small).toPathData(2);
  x += wA + gap;
  const U = caps.getPath('U', x, 41, big).toPathData(2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">
<rect x="1" y="1" width="62" height="62" rx="14" fill="${IVORY}" stroke="#B08D57" stroke-width="2"/>
<rect x="5" y="5" width="54" height="54" rx="10.5" fill="none" stroke="${GOLD}" stroke-width=".8"/>
<path fill="#A07A3E" d="${T}"/><path fill="#A07A3E" d="${U}"/>
<path fill="#C2185B" d="${amp}"/>
</svg>
`;
  await writeFile(pub('favicon.svg'), svg);
  await sharp(Buffer.from(svg), { density: 600 }).resize(180, 180).png().toFile(pub('apple-touch-icon.png'));
}

const [script, caps] = await Promise.all([
  loadFont('PinyonScript-Regular.ttf'),
  loadFont('Cinzel-Medium.ttf'),
]);
await variants();
await hero();
await ogImage(script, caps);
await favicon(script, caps);
console.log('Assets generated in public/');
