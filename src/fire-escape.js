import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const FLOOR_HEIGHT = 4.8;
export const STAIR_OPENING = {
  left: -1.25,
  right: -0.3,
  back: 0.35,
  front: 2.2,
};
export const FLOORS = [-FLOOR_HEIGHT, 0, FLOOR_HEIGHT, FLOOR_HEIGHT * 2];

// Split every deck bar at the stairwell. No deck geometry covers the opening.
export function deckSegments(x) {
  const hole = STAIR_OPENING;
  return x > hole.left && x < hole.right
    ? [
        [0, hole.back],
        [hole.front, 2.7],
      ]
    : [[0, 2.7]];
}

export function buildFireEscape() {
  const group = new THREE.Group();
  group.name = 'Connected fire escape';
  const parts = [];
  const transform = new THREE.Object3D();
  function box(x, y, z, w, h, d) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    geometry.translate(x, y, z);
    parts.push(geometry);
  }
  function beam(a, b, radius) {
    const start = new THREE.Vector3(...a),
      end = new THREE.Vector3(...b);
    const direction = end.clone().sub(start);
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      direction.length(),
      6,
    );
    transform.position.copy(start.add(end).multiplyScalar(0.5));
    transform.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    );
    transform.updateMatrix();
    geometry.applyMatrix4(transform.matrix);
    parts.push(geometry);
  }
  for (const floor of FLOORS) {
    for (let x = -3.8; x <= 3.8; x += 0.12) {
      for (const [start, end] of deckSegments(x)) {
        box(x, floor, (start + end) / 2, 0.035, 0.07, end - start);
      }
    }
    for (const z of [0, 2.7]) box(0, floor - 0.08, z, 7.8, 0.18, 0.1);
    for (const x of [-3.9, 3.9]) {
      box(x, floor - 0.08, 1.35, 0.1, 0.18, 2.7);
      beam([x, floor + 1.15, 0], [x, floor + 1.15, 2.7], 0.04);
      beam([x, floor - 1.1, 0], [x, floor, 2.7], 0.065);
    }
    for (let x = -3.8; x < 3.9; x += 0.4)
      beam([x, floor, 2.7], [x, floor + 1.15, 2.7], 0.024);
    beam([-3.9, floor + 1.15, 2.7], [3.9, floor + 1.15, 2.7], 0.045);
    // Rim the opening; its right edge is the landing for the descending flight.
    for (const x of [STAIR_OPENING.left, STAIR_OPENING.right]) {
      box(x, floor - 0.08, 1.275, 0.08, 0.14, 1.85);
    }
    for (const z of [0.35, 2.2]) box(-0.775, floor - 0.08, z, 0.95, 0.14, 0.08);
  }
  // Each flight descends toward the left. The next flight restarts on that side
  // of the upper landing, preserving an actual walkable path between floors.
  for (const floor of FLOORS.slice(0, -1)) {
    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      box(
        -3.6 + 3.3 * t,
        floor + FLOOR_HEIGHT * t - 0.05,
        1.275,
        0.25,
        0.07,
        1.65,
      );
    }
    for (const z of [0.43, 2.12]) {
      beam([-3.6, floor, z], [-0.3, floor + FLOOR_HEIGHT, z], 0.065);
      beam(
        [-3.6, floor + 0.95, z],
        [-0.3, floor + FLOOR_HEIGHT + 0.95, z],
        0.035,
      );
      for (let i = 0; i <= 20; i += 2) {
        const x = -3.6 + (3.3 * i) / 20,
          y = floor + (FLOOR_HEIGHT * i) / 20;
        beam([x, y, z], [x, y + 0.95, z], 0.02);
      }
    }
  }
  // Static ironwork is one mesh, so the extra storeys don't add hundreds of draw calls.
  const geometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  const iron = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: '#393446',
      roughness: 0.58,
      metalness: 0.65,
    }),
  );
  iron.castShadow = true;
  iron.receiveShadow = true;
  group.add(iron);
  return group;
}
