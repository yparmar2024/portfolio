import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgress } from '../src/progress.js';
function harness(target = 3) {
  let now = 0,
    id = 0,
    value = 0,
    completions = 0;
  const jobs = new Map();
  const p = createProgress(
    target,
    (v) => (value = v),
    () => completions++,
    (fn, delay) => {
      jobs.set(++id, { fn, at: now + delay });
      return id;
    },
    (key) => jobs.delete(key),
  );
  return {
    p,
    get value() {
      return value;
    },
    get completions() {
      return completions;
    },
    advance(ms) {
      const end = now + ms;
      while (true) {
        const next = [...jobs].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        now = next[1].at;
        jobs.delete(next[0]);
        next[1].fn();
      }
      now = end;
    },
  };
}
test('momentum decays after 800ms then every 500ms, and new input resets delay', () => {
  const h = harness();
  h.p.press();
  h.p.press();
  h.advance(799);
  assert.equal(h.value, 2);
  h.advance(1);
  assert.equal(h.value, 1);
  h.p.press();
  assert.equal(h.value, 2);
  h.advance(799);
  assert.equal(h.value, 2);
  h.advance(1);
  assert.equal(h.value, 1);
  h.advance(500);
  assert.equal(h.value, 0);
  h.advance(5000);
  assert.equal(h.value, 0);
});
test('completion is once-only and cancels decay', () => {
  const h = harness(5);
  for (let i = 0; i < 10; i++) h.p.press();
  assert.equal(h.completions, 1);
  assert.equal(h.value, 5);
  h.advance(5000);
  assert.equal(h.value, 5);
});
test('skip stops pending changes and reduced motion completes immediately', () => {
  const h = harness();
  h.p.press();
  h.p.stop();
  h.advance(5000);
  h.p.press();
  assert.equal(h.value, 1);
  assert.equal(h.completions, 0);
  const reduced = harness();
  reduced.p.press(true);
  assert.equal(reduced.completions, 1);
});
