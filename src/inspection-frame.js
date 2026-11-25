import { Vector3, MathUtils } from 'three';

// Fit a real surface, including its tilt/depth, inside the safe reading area.
export function frameSurface(corners, direction, aspect) {
  const point = corners
    .reduce((sum, corner) => sum.add(corner), new Vector3())
    .multiplyScalar(1 / corners.length);
  const normal = direction.clone().normalize();
  const right = new Vector3(0, 1, 0).cross(normal).normalize();
  const up = normal.clone().cross(right).normalize();
  const fov = aspect < 0.8 ? 70 : 55;
  const vertical = Math.tan(MathUtils.degToRad(fov / 2));
  let distance = 0.1;
  for (const corner of corners) {
    const offset = corner.clone().sub(point);
    distance = Math.max(
      distance,
      offset.dot(normal) +
        Math.max(
          Math.abs(offset.dot(right)) / (vertical * aspect * 0.87),
          Math.abs(offset.dot(up)) / (vertical * 0.74),
        ),
    );
  }
  return { point, view: point.clone().addScaledVector(normal, distance), fov };
}
