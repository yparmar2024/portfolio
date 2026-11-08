import * as THREE from 'three';

// Code-native artwork follows the supplied screenshot without including its dark background.
export function createPaper() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 672;
  const c = canvas.getContext('2d');
  c.fillStyle = '#fffaf3';
  c.beginPath();
  c.roundRect(12, 12, 1000, 648, 44);
  c.fill();
  c.fillStyle = '#f20b38';
  c.beginPath();
  c.roundRect(32, 32, 960, 608, 30);
  c.fill();
  c.fillStyle = '#fffaf9';
  c.beginPath();
  c.roundRect(49, 275, 926, 349, [0, 0, 18, 18]);
  c.fill();
  c.textAlign = 'center';
  c.fillStyle = '#fffaf3';
  c.font = '900 174px Arial';
  c.fillText('HELLO', 512, 203);
  c.font = '900 37px Arial';
  c.fillText('MY NAME IS...', 512, 253);
  c.save();
  c.translate(512, 467);
  c.rotate(-0.055);
  c.fillStyle = '#141b35';
  c.font = 'italic bold 184px Georgia';
  c.fillText('Yash', 0, 52);
  c.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.PlaneGeometry(2.7, 1.772, 48, 24);
  const rest = geometry.attributes.position.array.slice();
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    roughness: 0.95,
    alphaTest: 0.5,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'Name tag';
  // A pale reverse face moves with the front, rather than showing mirrored lettering.
  const reverseGeometry = geometry.clone();
  const backCanvas = document.createElement('canvas');
  backCanvas.width = 1024;
  backCanvas.height = 672;
  const backContext = backCanvas.getContext('2d');
  backContext.fillStyle = '#e9d5e1';
  backContext.beginPath();
  backContext.roundRect(12, 12, 1000, 648, 44);
  backContext.fill();
  const backTexture = new THREE.CanvasTexture(backCanvas);
  backTexture.colorSpace = THREE.SRGBColorSpace;
  const reverse = new THREE.Mesh(
    reverseGeometry,
    new THREE.MeshStandardMaterial({
      map: backTexture,
      side: THREE.BackSide,
      roughness: 1,
      alphaTest: 0.5,
    }),
  );
  // The front is only FrontSide; the reverse provides its own distinct paper surface.
  material.side = THREE.FrontSide;
  mesh.add(reverse);

  function deform(momentum, release, time, reduced, wind = 0) {
    const positions = geometry.attributes.position;
    const back = reverseGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = rest[i * 3],
        y = rest[i * 3 + 1];
      const side = Math.sign(x) || 1;
      const edge = Math.max(0, Math.abs(x) - 0.7);
      const corner = Math.max(0, (x + y - 1.65) / Math.SQRT2);
      const cornerAngle = 1.95 + momentum * 0.25;
      const fold = reduced
        ? 0
        : wind * (0.4 + Math.sin(time * 11 + side) * 0.28) +
          momentum * 0.65 +
          Math.sin((Math.min(1, release * 2) * Math.PI) / 2) * 2.1;
      const angle = fold * (edge / 0.65);
      const flutter = reduced
        ? 0
        : Math.sin(time * 7 + x * 3 + y * 2) *
          (0.012 + release * 0.07 + wind * 0.11);
      const xx =
        side * (Math.min(Math.abs(x), 0.7) + Math.cos(angle) * edge) +
        ((Math.cos(cornerAngle) - 1) * corner) / Math.SQRT2;
      const yy = y + ((Math.cos(cornerAngle) - 1) * corner) / Math.SQRT2;
      const zz =
        Math.sin(angle) * edge + Math.sin(cornerAngle) * corner + flutter;
      positions.setXYZ(i, xx, yy, zz);
      back.setXYZ(i, xx, yy, zz - 0.003);
    }
    positions.needsUpdate = back.needsUpdate = true;
    geometry.computeVertexNormals();
    reverseGeometry.computeVertexNormals();
    // Updating the bounds keeps raycasting accurate as the corners curl.
    geometry.computeBoundingSphere();
  }
  return { mesh, deform };
}
