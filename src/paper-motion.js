export const PAPER_ARRIVAL_MS = 2100;
export const PAPER_DISTANCE = 3.35;

// Camera-local poses: enter diagonally, catch a cross-gust, rush the lens,
// overshoot, then lose energy. Tangents keep the path continuous at each gust.
const poses = [
  { t: 0, x: -4.8, y: 2.5, z: -7.8, rx: 0.9, ry: -2.8, rz: -1.5 },
  { t: 0.27, x: -1.4, y: -0.45, z: -5.9, rx: -0.55, ry: 1.6, rz: 0.8 },
  { t: 0.53, x: 0.38, y: 0.24, z: -3.8, rx: 0.3, ry: -0.55, rz: -0.3 },
  { t: 0.72, x: -0.09, y: -0.08, z: -3.08, rx: -0.12, ry: 0.2, rz: 0.15 },
  { t: 1, x: 0, y: 0, z: -PAPER_DISTANCE, rx: 0, ry: 0, rz: 0.08 },
];
const properties = ['x', 'y', 'z', 'rx', 'ry', 'rz'];
function tangent(index, property) {
  if (index === 0 || index === poses.length - 1) return 0;
  return (
    (poses[index + 1][property] - poses[index - 1][property]) /
    (poses[index + 1].t - poses[index - 1].t)
  );
}

export function samplePaperArrival(
  elapsedMs,
  variant = { side: 1, gust: 1 },
  reduced = false,
) {
  const t = reduced
    ? 1
    : Math.min(1, Math.max(0, elapsedMs / PAPER_ARRIVAL_MS));
  if (t === 1) return { ...poses.at(-1), wind: 0, ready: true };
  const index = Math.max(
    0,
    poses.findIndex((pose, i) => i < poses.length - 1 && t <= poses[i + 1].t),
  );
  const a = poses[index],
    b = poses[index + 1];
  const span = b.t - a.t,
    u = (t - a.t) / span;
  const result = {};
  for (const property of properties) {
    result[property] =
      (2 * u ** 3 - 3 * u ** 2 + 1) * a[property] +
      (u ** 3 - 2 * u ** 2 + u) * span * tangent(index, property) +
      (-2 * u ** 3 + 3 * u ** 2) * b[property] +
      (u ** 3 - u ** 2) * span * tangent(index + 1, property);
  }
  result.x *= variant.side;
  result.y *= variant.gust;
  result.rx *= variant.gust;
  result.ry *= variant.side;
  result.rz = 0.08 + (result.rz - 0.08) * variant.side;
  result.wind = Math.sin(Math.PI * t) * variant.gust;
  result.ready = t >= 1;
  return result;
}

export function paperScale(aspect, fov = 48) {
  const height = 2 * PAPER_DISTANCE * Math.tan((fov * Math.PI) / 360);
  // Include the resting tilt so the corners stay within the viewport.
  const widthBound = 2.7 * Math.cos(0.08) + 1.772 * Math.sin(0.08);
  const heightBound = 1.772 * Math.cos(0.08) + 2.7 * Math.sin(0.08);
  return Math.min(
    (height * aspect * 0.9) / widthBound,
    (height * 0.72) / heightBound,
  );
}
