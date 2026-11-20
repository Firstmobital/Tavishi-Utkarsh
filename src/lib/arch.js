/**
 * Rajasthani scalloped (cusped) jharokha arch generator.
 *
 * Builds an SVG path for an arch whose opening is a pointed ogee curve
 * broken into round lobes, with cusps pointing inwards. Everything is
 * computed in a W x H coordinate space; `scale` lets us emit the same
 * shape normalised to 0..1 for clipPathUnits="objectBoundingBox".
 */

const r2 = (n) => Math.round(n * 1000) / 1000;

function cubic(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

/** Points spaced evenly (by arc length) along the left half of the arch. */
function leftCurvePoints({ x0, cx, shoulderY, apexY, lobes }) {
  const rise = shoulderY - apexY;
  const P0 = [x0, shoulderY];
  const P1 = [x0, shoulderY - rise * 0.5];
  const P2 = [cx - (cx - x0) * 0.4, apexY + rise * 0.26];
  const P3 = [cx, apexY];

  const N = 240;
  const samples = [];
  let len = 0;
  let prev = P0;
  for (let i = 0; i <= N; i++) {
    const p = cubic(P0, P1, P2, P3, i / N);
    if (i > 0) len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    samples.push({ p, len });
    prev = p;
  }
  const pts = [];
  let j = 0;
  for (let k = 0; k <= lobes; k++) {
    const target = (len * k) / lobes;
    while (j < samples.length - 1 && samples[j].len < target) j++;
    pts.push(samples[j].p);
  }
  pts[0] = P0;
  pts[pts.length - 1] = P3;
  return pts;
}

/**
 * @param {object} o
 * @param {number} o.W        width of the coordinate space
 * @param {number} o.topH     y of the shoulders (where the straight sides begin)
 * @param {number} o.bottom   y where the straight sides end
 * @param {number} [o.inset]  inset for inner concentric lines
 * @param {number} [o.apex]   y of the apex (before inset)
 * @param {number} [o.lobes]  lobes on each side
 * @param {boolean} [o.closed] close the path along the bottom (for fills/clips)
 * @param {number} [o.sx]     x scale for output
 * @param {number} [o.sy]     y scale for output
 * @param {number} [o.ox]     x offset (applied before scaling)
 * @param {number} [o.oy]     y offset (applied before scaling)
 */
export function archPath({
  W,
  topH,
  bottom,
  inset = 0,
  apex = 14,
  lobes = 5,
  closed = false,
  sx = 1,
  sy = 1,
  ox = 0,
  oy = 0,
}) {
  const x0 = inset;
  const x1 = W - inset;
  const cx = W / 2;
  const apexY = apex + inset * 1.15;
  const shoulderY = topH;
  const left = leftCurvePoints({ x0, cx, shoulderY, apexY, lobes });
  const right = left
    .slice(0, -1)
    .reverse()
    .map(([x, y]) => [W - x, y]);
  const pts = [...left, ...right];

  const X = (x) => r2((x + ox) * sx);
  const Y = (y) => r2((y + oy) * sy);
  let d = `M${X(x0)} ${Y(bottom)}L${X(x0)} ${Y(shoulderY)}`;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const chord = Math.hypot(bx - ax, by - ay);
    const r = chord * 0.78;
    d += `A${r2(r * sx)} ${r2(r * sy)} 0 0 1 ${X(bx)} ${Y(by)}`;
  }
  d += `L${X(x1)} ${Y(bottom)}`;
  if (closed) d += 'Z';
  return { d, cusps: pts };
}

/* Shared dimensions for the arch "top piece" used on variable-height cards. */
export const ARCH_TOP = { W: 300, H: 130, shoulder: 124 };
