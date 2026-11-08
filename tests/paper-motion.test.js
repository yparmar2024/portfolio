import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  samplePaperArrival,
  paperScale,
  PAPER_ARRIVAL_MS,
  PAPER_DISTANCE,
} from '../src/paper-motion.js';

test('wind flight crosses the frame, overshoots in depth and settles for every variant', () => {
  for (const side of [-1, 1]) {
    const variant = { side, gust: 1.12 };
    const start = samplePaperArrival(0, variant);
    const cross = samplePaperArrival(PAPER_ARRIVAL_MS * 0.53, variant);
    const near = samplePaperArrival(PAPER_ARRIVAL_MS * 0.72, variant);
    const end = samplePaperArrival(PAPER_ARRIVAL_MS, variant);
    assert.ok(start.x * cross.x < 0);
    assert.ok(near.z > end.z);
    assert.ok(Math.abs(start.ry - cross.ry) > 2);
    assert.deepEqual(
      [end.x, end.y, end.z, end.rx, end.ry, end.rz],
      [0, 0, -PAPER_DISTANCE, 0, 0, 0.08],
    );
    assert.equal(end.ready, true);
    for (let ms = 0; ms < PAPER_ARRIVAL_MS; ms += 25) {
      const a = samplePaperArrival(ms, variant),
        b = samplePaperArrival(ms + 1, variant);
      assert.ok(Number.isFinite(a.x + a.y + a.z + a.rx + a.ry + a.rz));
      assert.ok(Math.abs(b.x - a.x) < 0.03);
      assert.equal(a.ready, false);
    }
  }
});
test('reduced motion is immediately readable and paper fits portrait and landscape', () => {
  const reduced = samplePaperArrival(0, { side: -1, gust: 1.1 }, true);
  assert.equal(reduced.ready, true);
  assert.equal(reduced.wind, 0);
  assert.equal(reduced.z, -PAPER_DISTANCE);
  for (const aspect of [320 / 568, 390 / 844, 1440 / 900, 844 / 390]) {
    const scale = paperScale(aspect);
    const height = 2 * PAPER_DISTANCE * Math.tan((24 * Math.PI) / 180);
    assert.ok(
      scale * (2.7 * Math.cos(0.08) + 1.772 * Math.sin(0.08)) <=
        height * aspect * 0.901,
    );
    assert.ok(
      scale * (1.772 * Math.cos(0.08) + 2.7 * Math.sin(0.08)) <= height * 0.721,
    );
  }
});
