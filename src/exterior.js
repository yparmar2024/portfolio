import * as THREE from 'three';
import { buildFireEscape } from './fire-escape.js';
export function createExterior(scene) {
  const materials = new Map();
  const mat = (color, extra = {}) => {
    const key = color + JSON.stringify(extra);
    if (!materials.has(key))
      materials.set(
        key,
        new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra }),
      );
    return materials.get(key);
  };
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  function box(x, y, z, w, h, d, color, parent = scene, extra = {}) {
    const m = new THREE.Mesh(
      boxGeometry,
      typeof color === 'string' ? mat(color, extra) : color,
    );
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function rod(a, b, r, color, parent = scene) {
    const start = new THREE.Vector3(...a),
      end = new THREE.Vector3(...b),
      delta = end.clone().sub(start);
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, delta.length(), 8),
      mat(color, { metalness: 0.55, roughness: 0.48 }),
    );
    m.position.copy(start.add(end).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.normalize(),
    );
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  let seed = 29;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  // Brickwork is instanced geometry, including real mortar gaps and a true window opening.
  // Four wall pieces keep the central opening physically clear.
  box(-7, 3, -0.25, 10.6, 18, 0.4, '#222a3b');
  box(7, 3, -0.25, 10.6, 18, 0.4, '#222a3b');
  box(0, 8, -0.25, 3.4, 7.8, 0.4, '#222a3b');
  box(0, -3.65, -0.25, 3.4, 8.7, 0.4, '#222a3b');
  const bricks = [];
  for (let row = -20; row < 45; row++)
    for (let col = -20; col < 20; col++) {
      const x = col * 0.66 + (row % 2) * 0.33,
        y = row * 0.24;
      if (Math.abs(x) < 2.02 && y > 0.6 && y < 4.65) continue;
      bricks.push([x, y]);
    }
  const brickMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.63, 0.215, 0.16),
    mat('#70798d'),
    bricks.length,
  );
  const dummy = new THREE.Object3D();
  bricks.forEach(([x, y], i) => {
    dummy.position.set(x, y, 0.07 + random() * 0.025);
    dummy.updateMatrix();
    brickMesh.setMatrixAt(i, dummy.matrix);
    brickMesh.setColorAt(
      i,
      new THREE.Color().setHSL(
        0.59 + random() * 0.05,
        0.12 + random() * 0.1,
        0.24 + random() * 0.16,
      ),
    );
  });
  brickMesh.receiveShadow = true;
  scene.add(brickMesh);
  for (const x of [-1.8, 1.8]) box(x, 2.65, 0.12, 0.17, 4.1, 0.4, '#343b4b');
  box(0, 4.7, 0.15, 4, 0.22, 0.65, '#9c8b83');
  box(0, 0.6, 0.25, 4, 0.22, 0.8, '#90817c');
  const sash = new THREE.Group();
  scene.add(sash);
  for (const x of [-1.63, 1.63])
    box(x, 1.65, 0.1, 0.1, 1.9, 0.13, '#75655e', sash);
  for (const y of [0.7, 2.6]) box(0, y, 0.1, 3.35, 0.1, 0.13, '#75655e', sash);
  box(0, 1.65, 0.1, 0.055, 1.9, 0.1, '#75655e', sash);
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#69899e',
    transparent: true,
    opacity: 0.16,
    roughness: 0.1,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });
  box(0, 1.65, 0.08, 3.2, 1.8, 0.025, glass, sash);
  for (let y = 2.75; y < 4.5; y += 0.15)
    box(0, y, -0.15, 3.25, 0.09, 0.08, '#897e74');
  scene.add(buildFireEscape());
  // Neighbor windows and drainpipes give widescreen framing depth.
  for (const x of [-6.8, 6.8]) {
    box(x, 2.6, 0.21, 2.5, 3.8, 0.22, '#151b2a');
    box(x, 2.6, 0.35, 2.2, 3.5, 0.05, '#6f6268', scene, {
      emissive: '#874a46',
      emissiveIntensity: 0.18,
    });
    for (let y = 1; y < 4.3; y += 0.2)
      box(x, y, 0.42, 2.2, 0.07, 0.05, '#323045');
    rod([x + 1.8, -6, 0.4], [x + 1.8, 12, 0.4], 0.09, '#3a3b4d');
  }
  return { sash };
}
