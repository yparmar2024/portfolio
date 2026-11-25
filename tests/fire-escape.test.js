import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFireEscape,
  deckSegments,
  FLOORS,
  STAIR_OPENING,
} from '../src/fire-escape.js';

test('deck has an unobstructed descending stairwell and continuous side walkways', () => {
  for (const x of [-1.2, -0.8, -0.35]) {
    const segments = deckSegments(x);
    assert.equal(segments.length, 2);
    for (const [start, end] of segments)
      assert.ok(end <= STAIR_OPENING.back || start >= STAIR_OPENING.front);
  }
  assert.deepEqual(deckSegments(-2), [[0, 2.7]]);
  assert.deepEqual(deckSegments(2), [[0, 2.7]]);
});

test('connected geometry spans lower and upper floors without invalid coordinates', () => {
  const escape = buildFireEscape();
  assert.equal(escape.children.length, 1);
  const mesh = escape.children[0];
  mesh.geometry.computeBoundingBox();
  assert.ok(mesh.geometry.boundingBox.min.y < FLOORS[0]);
  assert.ok(mesh.geometry.boundingBox.max.y > FLOORS.at(-1));
  assert.ok(mesh.geometry.attributes.position.array.every(Number.isFinite));
  mesh.geometry.dispose();
  mesh.material.dispose();
});
