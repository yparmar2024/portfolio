export function createProgress(
  target,
  update,
  complete,
  schedule = setTimeout,
  cancel = clearTimeout,
) {
  let value = 0,
    timer,
    done = false;
  function decay() {
    value = Math.max(0, value - 1);
    update(value);
    if (value) timer = schedule(decay, 500);
  }
  return {
    press(single = false) {
      if (done) return;
      cancel(timer);
      value = single ? target : value + 1;
      update(value);
      if (value >= target) {
        done = true;
        complete();
      } else timer = schedule(decay, 800);
    },
    stop() {
      done = true;
      cancel(timer);
    },
  };
}
