import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { frameSurface } from '../src/inspection-frame.js';

for (const aspect of [1440 / 900, 390 / 844, 320 / 568]) {
  test(`reading surfaces fit the safe viewport at aspect ${aspect.toFixed(2)}`, () => {
    // Includes a wall board and a tilted desktop page: depth affects projection.
    const surfaces = [
      {
        corners: [
          [-1.2, -0.64, 0],
          [1.2, -0.64, 0],
          [1.2, 0.64, 0],
          [-1.2, 0.64, 0],
        ],
        direction: [0, -0.05, 1],
      },
      {
        corners: [
          [-0.2125, 0, -0.1675],
          [0.2125, 0, -0.1675],
          [0.2125, 0, 0.1675],
          [-0.2125, 0, 0.1675],
        ],
        direction: [0, 1, 0.35],
      },
    ];
    for (const surface of surfaces) {
      const corners = surface.corners.map((p) => new Vector3(...p));
      const { point, view, fov } = frameSurface(
        corners,
        new Vector3(...surface.direction),
        aspect,
      );
      const camera = new PerspectiveCamera(fov, aspect, 0.01, 100);
      camera.position.copy(view);
      camera.lookAt(point);
      camera.updateMatrixWorld();
      for (const corner of corners) {
        const projected = corner.clone().project(camera);
        assert.ok(
          Math.abs(projected.x) <= 0.870001,
          'horizontal reading margin',
        );
        assert.ok(Math.abs(projected.y) <= 0.740001, 'vertical reading margin');
        assert.ok(
          projected.z > -1 && projected.z < 1,
          'surface in front of camera',
        );
      }
    }
  });
}
