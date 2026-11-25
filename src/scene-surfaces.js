import { turnPage } from './turn-page.js';
import * as THREE from 'three';
import { drawScenePrint } from './scene-print.js';
import { frameSurface } from './inspection-frame.js';

export function createSceneSurfaces(root, renderer, targets) {
  const surfaces = new Map();
  root.traverse((object) => {
    const name = object.userData.contentSurface;
    if (!object.isMesh || !name) return;
    const geometry = object.geometry;
    const uv = geometry.getAttribute('uv');
    const position = geometry.getAttribute('position');
    const corners = [];
    for (const [u, v] of [
      [0, 0],
      [1, 0],
      [0, 1],
    ]) {
      let nearest = 0,
        distance = Infinity;
      for (let i = 0; i < uv.count; i++) {
        const d = (uv.getX(i) - u) ** 2 + (uv.getY(i) - v) ** 2;
        if (d < distance) {
          distance = d;
          nearest = i;
        }
      }
      corners.push(
        new THREE.Vector3()
          .fromBufferAttribute(position, nearest)
          .applyMatrix4(object.matrixWorld),
      );
    }
    // glTF UVs have their origin at the image's top-left.
    const [origin, right, down] = corners;
    right.sub(origin);
    down.sub(origin);
    surfaces.set(name, { object, origin, right, down });
  });
  let compact;
  const indices = new Map();
  function update(aspect, changed) {
    if (!changed && compact === aspect < 0.8) return;
    compact = aspect < 0.8;
    for (const [name, surface] of surfaces) {
      if (changed && name !== changed) continue;
      const {
        canvas,
        rect,
        links = [],
      } = drawScenePrint(name, compact, indices.get(name) || 0);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      texture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy(),
      );
      const old = surface.object.material;
      // Retain baked vertex contact shading and the physical paper response.
      if (!surface.material) {
        surface.material = old.clone();
        surface.object.material = surface.material;
        surface.material.emissive.set('#ffffff');
        surface.material.emissiveIntensity = 0.16;
        surface.material.roughness = 0.9;
      }
      surface.texture?.dispose();
      surface.texture = texture;
      surface.material.map = texture;
      surface.material.emissiveMap = texture;
      surface.material.needsUpdate = true;
      surface.rect = rect;
      surface.links = links;
    }
  }
  return {
    setPage(name, index) {
      if ((indices.get(name) || 0) === index) return;
      const old = surfaces.get(name).texture.image;
      const previous = indices.get(name) || 0;
      indices.set(name, index);
      update(compact ? 0.5 : 1, name);
      if (
        name === 'Projects' &&
        !matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        turnPage(old, surfaces.get(name).texture, index > previous);
    },
    linkAt(hit) {
      if (!hit?.uv) return null;
      const surface = surfaces.get(hit.object.userData.contentSurface);
      if (surface?.object !== hit.object) return null;
      const { x, y } = hit.uv;
      return surface.links.find(
        ({ bounds: [left, top, right, bottom] }) =>
          x >= left && x <= right && y >= top && y <= bottom,
      );
    },
    frame(name, aspect) {
      update(aspect);
      const surface = surfaces.get(name);
      const target = targets.find((item) => item.name === name);
      if (!surface) throw new Error(`Missing room reading surface: ${name}`);
      const { origin, right, down, rect } = surface;
      const [x0, y0, x1, y1] = rect;
      const corners = [
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ].map(([x, y]) =>
        origin.clone().addScaledVector(right, x).addScaledVector(down, y),
      );
      const center = origin
        .clone()
        .addScaledVector(right, 0.5)
        .addScaledVector(down, 0.5);
      let direction = target.view.clone().sub(center).normalize();
      if (name === 'Projects') {
        const normal = down.clone().cross(right).normalize();
        if (normal.dot(direction) < 0) normal.negate();
        direction = direction.lerp(normal, 0.55).normalize();
      }
      return frameSurface(corners, direction, aspect);
    },
    update,
  };
}
