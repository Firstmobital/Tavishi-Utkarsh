/**
 * Hand-drawn style ornaments, all original inline SVG.
 * They are emitted once as an SVG sprite (<symbol>s) and referenced with <use>.
 */

const C = {
  stem: '#6B4A2B',
  leaf: '#0F3D2E',
  leaf2: '#2F6B4E',
  rose: '#C2185B',
  rose2: '#D9467E',
  pink: '#EC8FB1',
  blush: '#F6C9D6',
  cream: '#FFF6E2',
  gold: '#B08D57',
  goldLight: '#C9A45C',
};

const LEAF = 'M0 0C5-5.5 14-6 21 0C14 6 5 5.5 0 0Z';
const BRACT = 'M0 0C-6.5-2.5-9-11-2.6-16.5Q0-18.4 2.6-16.5C9-11 6.5-2.5 0 0Z';

const leaf = ([x, y, a, s = 1, c = C.leaf]) =>
  `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="${LEAF}" fill="${c}"/><path d="M1 0H17" stroke="${C.cream}" stroke-opacity=".35" stroke-width=".6"/></g>`;

/** A bougainvillea cluster: three papery bracts with tiny cream florets. */
const cluster = ([x, y, rot = 0, s = 1, tone = 0]) => {
  const fills = [
    [C.rose, C.rose2, C.pink],
    [C.rose2, C.pink, C.blush],
    [C.pink, C.blush, C.rose2],
  ][tone];
  const bracts = [0, 120, 240]
    .map(
      (a, i) =>
        `<g transform="rotate(${a})"><path d="${BRACT}" fill="${fills[i]}" stroke="#8E1B47" stroke-opacity=".35" stroke-width=".5"/><path d="M0-2V-13M0-7l-3-3M0-9l3-3" stroke="#8E1B47" stroke-opacity=".28" stroke-width=".45" fill="none"/></g>`,
    )
    .join('');
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${bracts}<circle r="1.6" cy="-1" fill="${C.cream}"/><circle r="1.2" cx="1.8" cy="1.2" fill="${C.cream}"/><circle r="1.2" cx="-1.8" cy="1.2" fill="${C.cream}"/></g>`;
};

/** Corner sprig of bougainvillea — grows from the top-left corner (0,0). */
function sprig() {
  const stems = [
    'M2 3C34 8 64 24 92 52S132 104 140 128',
    'M30 10C38 30 40 52 30 80',
    'M64 26C84 26 104 16 124 4',
    'M92 52C80 70 76 88 80 108',
  ];
  const leaves = [
    [16, 6, -30, 0.9, C.leaf2],
    [24, 7, 40, 0.8],
    [42, 14, -60, 0.95],
    [50, 18, 30, 1, C.leaf2],
    [34, 34, 150, 0.85],
    [38, 44, 20, 0.8, C.leaf2],
    [78, 38, -40, 1],
    [84, 22, -100, 0.75, C.leaf2],
    [104, 16, -20, 0.85],
    [104, 66, 20, 1, C.leaf2],
    [112, 82, 110, 0.9],
    [86, 76, 160, 0.85, C.leaf2],
    [124, 104, 40, 0.8],
    [132, 112, 150, 0.7, C.leaf2],
  ];
  const clusters = [
    [30, 82, 10, 1.05, 0],
    [22, 66, -30, 0.8, 1],
    [128, 14, 70, 0.95, 0],
    [110, 24, 20, 0.75, 2],
    [80, 110, -20, 1, 1],
    [94, 96, 40, 0.8, 0],
    [140, 130, 0, 0.95, 0],
    [60, 26, 30, 0.7, 2],
    [124, 116, -50, 0.7, 1],
  ];
  return `<symbol id="o-sprig" viewBox="0 0 160 150">
    <g fill="none" stroke="${C.stem}" stroke-width="1.5" stroke-linecap="round">${stems
      .map((d) => `<path d="${d}"/>`)
      .join('')}</g>
    ${leaves.map(leaf).join('')}
    ${clusters.map(cluster).join('')}
  </symbol>`;
}

/** Small floral corner for cards: a lotus bud with two leaves and a bract pair. */
function cornerFloral() {
  return `<symbol id="o-corner" viewBox="0 0 90 90">
    <g fill="none" stroke="${C.stem}" stroke-width="1.2" stroke-linecap="round">
      <path d="M8 8C26 12 42 24 56 40"/>
      <path d="M8 8C12 26 24 42 40 56"/>
    </g>
    ${leaf([30, 13, 20, 0.8])}
    ${leaf([13, 30, 70, 0.8, C.leaf2])}
    ${leaf([46, 24, 60, 0.7, C.leaf2])}
    ${leaf([24, 46, 30, 0.7])}
    ${cluster([58, 42, 30, 0.85, 0])}
    ${cluster([42, 58, -60, 0.85, 1])}
    ${cluster([30, 30, 45, 0.7, 2])}
  </symbol>`;
}

/** Lotus used at the centre of gold dividers. */
function lotus() {
  return `<symbol id="o-lotus" viewBox="0 0 48 30">
    <g fill="none" stroke="${C.gold}" stroke-width="1.1" stroke-linejoin="round">
      <path d="M24 2C29 8 29 17 24 24C19 17 19 8 24 2Z" fill="${C.blush}" fill-opacity=".8"/>
      <path d="M24 24C22 16 15 10 9 9C10 16 15 22 24 24Z" fill="${C.blush}" fill-opacity=".5"/>
      <path d="M24 24C26 16 33 10 39 9C38 16 33 22 24 24Z" fill="${C.blush}" fill-opacity=".5"/>
      <path d="M24 24C18 21 9 20 2 22C8 26 16 27 24 24Z"/>
      <path d="M24 24C30 21 39 20 46 22C40 26 32 27 24 24Z"/>
      <path d="M14 28H34" stroke-linecap="round"/>
    </g>
  </symbol>`;
}

/** Finial above an arch apex: a small bud on a stem. */
function finial() {
  return `<symbol id="o-finial" viewBox="0 0 24 30">
    <g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
      <path d="M12 1C17 6 17 12 12 17C7 12 7 6 12 1Z" fill="currentColor" fill-opacity=".25"/>
      <path d="M12 17V29M12 22C9 20 6 21 4 23M12 22C15 20 18 21 20 23"/>
    </g>
  </symbol>`;
}

const ICON = (id, body, vb = '0 0 24 24') =>
  `<symbol id="i-${id}" viewBox="${vb}"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</g></symbol>`;

function icons() {
  return [
    ICON('pin', '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.8" r="2.4"/>'),
    ICON('calendar', '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4M12 13v4M10 15h4"/>'),
    ICON('phone', '<path d="M6.6 3.5h2.6l1.4 4.1-2 1.4a12 12 0 0 0 6.4 6.4l1.4-2 4.1 1.4v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>'),
    ICON('chat', '<path d="M4.2 19.8l1.1-3.9A8 8 0 1 1 8.4 19l-4.2.8Z"/><path d="M9 10.2h6M9 13.4h4"/>'),
    ICON('play', '<path d="M8.5 6.2v11.6L18 12 8.5 6.2Z" fill="currentColor"/>'),
    ICON('pause', '<path d="M9 6.5v11M15 6.5v11" stroke-width="2.4"/>'),
    ICON('chevron', '<path d="M6 9.5l6 6 6-6"/>'),
    ICON('close', '<path d="M6 6l12 12M18 6L6 18"/>'),
    ICON('arrow', '<path d="M5 12h14M13 6l6 6-6 6"/>'),
    ICON('note', '<path d="M9 17.5V5.5l10-2v12"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>'),
  ].join('');
}

export function sprite() {
  return `<svg class="sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs>${sprig()}${cornerFloral()}${lotus()}${finial()}${icons()}</defs></svg>`;
}

export const use = (id, cls = '', extra = '') =>
  `<svg class="${cls}" aria-hidden="true" focusable="false"${extra}><use href="#${id}"/></svg>`;

/** Gold line divider with a lotus centre. */
export const divider = (cls = '') =>
  `<div class="divider ${cls}" aria-hidden="true"><span class="divider__line"></span>${use('o-lotus', 'divider__lotus')}<span class="divider__line"></span></div>`;
