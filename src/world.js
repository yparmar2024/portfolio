import { createPostprocessing } from './postprocessing.js';
import * as THREE from 'three';
import { createRenderer } from './renderer.js';
import { createPaper } from './paper.js';
import { loadRoom } from './room.js';
import {
  samplePaperArrival,
  paperScale,
  PAPER_DISTANCE,
} from './paper-motion.js';

// Everything occupies the same world: the exterior is +Z, the bedroom is -Z.
export function createWorld(canvas, reducedMotion) {
  const { renderer, scene, camera, sash, moon } = createRenderer(canvas);
  // Three-dimensional paper bends as momentum accumulates.
  const { mesh: paper, deform: deformPaper } = createPaper();
  camera.add(paper);
  paper.position.set(0, 0, -4);
  paper.rotation.z = 0.08;
  const paperLight = new THREE.PointLight('#fff0d1', 15, 6);
  paperLight.position.set(-1, 1, -2);
  camera.add(paperLight);
  const { composer, print } = createPostprocessing(renderer, scene, camera);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const windowTarget = new THREE.Mesh(
    new THREE.PlaneGeometry(3.7, 4.2),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false }),
  );
  windowTarget.position.set(0, 2.6, 0.5);
  scene.add(windowTarget);
  function rayHit(object, x, y) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((x - bounds.left) / bounds.width) * 2 - 1,
      (-(y - bounds.top) / bounds.height) * 2 + 1,
    );
    camera.updateMatrixWorld(true);
    object.updateWorldMatrix(true, true);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(object, false).length > 0;
  }
  const targets = [];
  let room,
    focused = null,
    transition = null,
    yaw = 0,
    pitch = 0;
  let mode = 'paper',
    progress = 0,
    current = 0,
    entry = 0,
    flight = 0,
    elapsed = 0,
    last = 0,
    raf,
    paused = false,
    stateStarted = performance.now();
  let arrivalVariant = { side: 1, gust: 1 };
  let paperReady = reducedMotion.matches;
  const aim = new THREE.Vector3(),
    position = new THREE.Vector3();
  function resize() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    print.uniforms.resolution.value.set(
      w * renderer.getPixelRatio(),
      h * renderer.getPixelRatio(),
    );
  }
  addEventListener('resize', resize);
  resize();
  const outside = new THREE.Vector3(),
    insideCam = new THREE.Vector3(0, 2.5, -2.1);
  const roomAim = new THREE.Vector3(-0.84, 1.9, -8.7);
  const ready = loadRoom(scene).then((result) => {
    room = result;
    targets.push(...room.targets);
    insideCam.copy(room.overview);
    roomAim.copy(room.lookAt);
    moon.shadow.needsUpdate = true;
  });
  function render(time) {
    raf = requestAnimationFrame(render);
    if (paused) return;
    const dt = Math.min((time - last) / 1000 || 0, 0.05);
    last = time;
    elapsed += dt;
    current = THREE.MathUtils.damp(current, progress, 12, dt);
    const sashY = mode === 'paper' || mode === 'peeling' ? 0 : current * 2.02;
    if (Math.abs(sash.position.y - sashY) > 0.001)
      moon.shadow.needsUpdate = true;
    sash.position.y = sashY;
    const entering = mode === 'entering' || mode === 'room';
    entry =
      mode === 'room'
        ? 1
        : entering
          ? Math.min(
              1,
              (time - stateStarted) / (reducedMotion.matches ? 100 : 2800),
            )
          : 0;
    const ease = entry * entry * (3 - 2 * entry);
    outside.set(0.3, 2.8, camera.aspect < 0.8 ? 12.5 : 9.8);
    position.lerpVectors(outside, insideCam, ease);
    camera.position.copy(position);
    const overviewAim = roomAim
      .clone()
      .sub(insideCam)
      .applyEuler(
        new THREE.Euler(
          pitch,
          yaw + (camera.aspect < 0.8 ? -0.42 : 0),
          0,
          'YXZ',
        ),
      )
      .add(insideCam);
    aim.lerpVectors(new THREE.Vector3(0, 2.6, 0), overviewAim, ease);
    let fov = 48 + ease * (camera.aspect < 0.8 ? 32 : 22);
    if (mode === 'room') {
      if (focused) {
        camera.position.copy(focused.view);
        aim
          .copy(focused.point)
          .sub(focused.view)
          .applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'))
          .add(focused.view);
        fov = camera.aspect < 0.8 ? 70 : 55;
      }
      if (transition) {
        const t = Math.min(
            1,
            (time - transition.started) / (reducedMotion.matches ? 100 : 950),
          ),
          e = t * t * (3 - 2 * t);
        camera.position.lerpVectors(transition.eye, camera.position.clone(), e);
        aim.lerpVectors(transition.aim, aim.clone(), e);
        fov = THREE.MathUtils.lerp(transition.fov, fov, e);
        if (t === 1) transition = null;
      }
    }
    camera.lookAt(aim);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    paper.visible = mode === 'paper' || mode === 'peeling';
    paperLight.visible = paper.visible;
    if (mode === 'peeling')
      flight = Math.min(
        1,
        (time - stateStarted) / (reducedMotion.matches ? 100 : 1250),
      );
    else flight = 0;
    const arrival = samplePaperArrival(
      time - stateStarted,
      arrivalVariant,
      reducedMotion.matches,
    );
    paperReady = arrival.ready;
    if (mode === 'peeling') {
      const launch = Math.max(0, (flight - 0.25) / 0.75);
      paper.position.set(
        launch * launch * 8,
        Math.sin((launch * Math.PI) / 2) * 4,
        -PAPER_DISTANCE - launch * 5,
      );
      paper.rotation.set(
        launch * 1.1,
        launch * 3.5,
        0.08 - current * 0.05 + launch * 2.6,
      );
    } else {
      paper.position.set(arrival.x, arrival.y, arrival.z);
      paper.rotation.set(arrival.rx, arrival.ry, arrival.rz - current * 0.05);
    }
    if (paper.visible)
      deformPaper(
        mode === 'paper' ? current : 1,
        flight,
        elapsed,
        reducedMotion.matches,
        mode === 'paper' ? arrival.wind : 0,
      );
    paper.scale.setScalar(paperScale(camera.aspect));
    composer.render();
  }
  raf = requestAnimationFrame(render);
  function visibility() {
    paused = document.hidden;
    last = performance.now();
  }
  document.addEventListener('visibilitychange', visibility);
  function startView(target) {
    transition = {
      eye: camera.position.clone(),
      aim: aim.clone(),
      fov: camera.fov,
      started: performance.now(),
    };
    focused = target;
    yaw = 0;
    pitch = 0;
  }
  function itemAt(x, y) {
    if (!room || mode !== 'room') return null;
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((x - bounds.left) / bounds.width) * 2 - 1,
      (-(y - bounds.top) / bounds.height) * 2 + 1,
    );
    camera.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(room.root, true)[0];
    for (let object = hit?.object; object; object = object.parent) {
      if (object.userData.interaction)
        return targets.find(
          (t) => t.name.toLowerCase() === object.userData.interaction,
        )?.name;
    }
    return null;
  }
  return {
    ready,
    focus(name) {
      const target = targets.find((t) => t.name === name);
      if (target) startView(target);
    },
    clearFocus() {
      startView(null);
    },
    look(dx, dy) {
      if (mode === 'room') {
        const limit = focused ? 0.65 : 1.05;
        yaw = THREE.MathUtils.clamp(yaw + dx * 0.004, -limit, limit);
        pitch = THREE.MathUtils.clamp(pitch + dy * 0.003, -0.35, 0.35);
      }
    },
    hitItem: itemAt,
    setState(next) {
      mode = next;
      stateStarted = performance.now();
      focused = null;
      transition = null;
      yaw = 0;
      pitch = 0;
      if (next === 'paper') {
        entry = 0;
        progress = 0;
        current = 0;
        paperReady = reducedMotion.matches;
        arrivalVariant = {
          side: Math.random() < 0.5 ? -1 : 1,
          gust: 0.88 + Math.random() * 0.24,
        };
      }
    },
    setProgress(v) {
      progress = v;
    },
    projectTargets() {
      return targets.map((t) => {
        const p = t.point.clone().project(camera);
        return {
          ...t,
          x: (p.x * 0.5 + 0.5) * 100,
          y: (-p.y * 0.5 + 0.5) * 100,
          visible:
            !focused &&
            p.z > -1 &&
            p.z < 1 &&
            Math.abs(p.x) < 0.92 &&
            Math.abs(p.y) < 0.9,
        };
      });
    },
    isPaperReady() {
      return paperReady;
    },
    hitPaper(x, y) {
      return paperReady && paper.visible && rayHit(paper, x, y);
    },
    hitWindow(x, y) {
      return rayHit(windowTarget, x, y);
    },
    projectAction() {
      const p = (
        mode === 'paper' || mode === 'peeling'
          ? paper.localToWorld(new THREE.Vector3(0, -1.18, 0))
          : new THREE.Vector3(0, 1.3, 0.55)
      ).project(camera);
      return { x: (p.x * 0.5 + 0.5) * 100, y: (-p.y * 0.5 + 0.5) * 100 };
    },
    dispose() {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      scene.traverse((o) => {
        o.geometry?.dispose();
      });
      scene.traverse((o) => {
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          if (m) {
            for (const value of Object.values(m))
              if (value?.isTexture) value.dispose();
            m.dispose();
          }
        }
      });
      composer.dispose();
      renderer.dispose();
    },
  };
}
