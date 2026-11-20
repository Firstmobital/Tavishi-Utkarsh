/**
 * Hand-drawn style ornaments, all original inline SVG.
 * They are emitted once as an SVG sprite (<symbol>s) and referenced with <use>.
 */

export const C = {
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

/** Fine gold filigree corner (line art) for cards. */
function filigreeCorner() {
  return `<symbol id="o-filigree" viewBox="0 0 64 64">
    <g fill="none" stroke="#B08D57" stroke-linecap="round">
      <path d="M3 61V22C3 11 11 3 22 3H61" stroke-width="1.3"/>
      <path d="M9 61V25C9 16 16 9 25 9H61" stroke-width=".7" stroke-opacity=".7"/>
      <path d="M22 3c-7 5-7 14 0 16 6 2 9-5 4-8" stroke-width="1"/>
      <path d="M3 22c5 7 14 7 16 0 2-6-5-9-8-4" stroke-width="1"/>
      <path d="M36 3q6 5 12 0M3 36q5 6 0 12" stroke-width=".9"/>
    </g>
    <path d="M14 14c5-2 9 2 7 7-5 2-9-2-7-7Z" fill="#C9A45C"/>
    <circle cx="61" cy="3" r="1.6" fill="#C9A45C"/><circle cx="3" cy="61" r="1.6" fill="#C9A45C"/>
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

export function sprite(extraDefs = '') {
  return `<svg class="sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><defs>${extraDefs}${lotus()}${finial()}${filigreeCorner()}${icons()}</defs></svg>`;
}

export const use = (id, cls = '', extra = '') =>
  `<svg class="${cls}" aria-hidden="true" focusable="false"${extra}><use href="#${id}"/></svg>`;

/** Gold line divider with a lotus centre. */
export const divider = (cls = '') =>
  `<div class="divider ${cls}" aria-hidden="true"><span class="divider__line"></span>${use('o-lotus', 'divider__lotus')}<span class="divider__line"></span></div>`;
