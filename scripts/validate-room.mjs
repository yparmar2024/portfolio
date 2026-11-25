import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const buffer = readFileSync(
  new URL('../public/models/room-draft.glb', import.meta.url),
);
assert.equal(buffer.readUInt32LE(0), 0x46546c67);
assert.equal(buffer.readUInt32LE(4), 2);
assert.equal(buffer.readUInt32LE(8), buffer.length);
const jsonLength = buffer.readUInt32LE(12);
const gltf = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString());
const binaryStart = 28 + jsonLength;
let compressedViews = 0;
await MeshoptDecoder.ready;
for (const view of gltf.bufferViews) {
  const compressed = view.extensions?.EXT_meshopt_compression;
  if (!compressed) continue;
  assert.equal(compressed.buffer, 0, 'Compressed data must be embedded');
  const start = binaryStart + (compressed.byteOffset ?? 0);
  const end = start + compressed.byteLength;
  assert.ok(end <= buffer.length, 'Compressed data must fit in the GLB');
  const decoded = new Uint8Array(compressed.count * compressed.byteStride);
  MeshoptDecoder.decodeGltfBuffer(
    decoded,
    compressed.count,
    compressed.byteStride,
    buffer.subarray(start, end),
    compressed.mode,
    compressed.filter,
  );
  compressedViews++;
}
const names = new Set(gltf.nodes.map((node) => node.name));
for (const name of ['About', 'Projects', 'Experience', 'Records']) {
  const surface = gltf.nodes.find(
    (node) => node.extras?.contentSurface === name,
  );
  assert.ok(
    surface?.mesh !== undefined,
    `Missing physical reading surface: ${name}`,
  );
  assert.ok(
    surface.extras.keep_separate,
    `Reading surface must remain editable: ${name}`,
  );
  const primitive = gltf.meshes[surface.mesh].primitives[0];
  assert.ok(
    primitive.attributes.TEXCOORD_0 !== undefined,
    `Reading surface needs UVs: ${name}`,
  );
  assert.ok(
    gltf.materials[primitive.material].pbrMetallicRoughness.baseColorTexture,
    `Missing packed reading texture: ${name}`,
  );
}
for (const name of [
  'About_Whiteboard',
  'Project_Notebook',
  'Experience_Board',
  'Record_Player',
  'Entry_Anchor',
  'Room_Overview',
  'Overview_Target',
  'Desk_Fan',
])
  assert.ok(names.has(name), `Missing ${name}`);
const entry = gltf.nodes.find(
  (node) => node.name === 'Entry_Anchor',
).translation;
assert.ok(
  Math.abs(-2 * entry[0] - 0.84) < 0.0001 &&
    Math.abs(-2 * entry[2] - 12.5) < 0.0001,
  'Room entrance must align with the exterior window',
);
for (const name of ['About', 'Projects', 'Experience', 'Records'])
  for (const prefix of ['Target_', 'View_'])
    assert.ok(names.has(prefix + name));
function hasGeometry(node) {
  return (
    node.mesh !== undefined ||
    (node.children ?? []).some((index) => hasGeometry(gltf.nodes[index]))
  );
}
for (const kind of ['about', 'projects', 'experience', 'records']) {
  assert.ok(
    gltf.nodes.some((n) => n.extras?.interaction === kind && hasGeometry(n)),
    `Missing selectable geometry for ${kind}`,
  );
}
assert.ok(
  gltf.buffers.every((b) => !b.uri),
  'GLB must be self-contained',
);
assert.ok(
  gltf.images?.length > 0,
  'Detailed room must include its surface maps',
);
assert.ok(
  gltf.images.every((image) => image.bufferView !== undefined && !image.uri),
  'All textures must be embedded',
);
assert.ok(
  gltf.nodes.some(
    (n) => n.name.startsWith('Ceiling removable') && n.mesh !== undefined,
  ),
  'Ceiling must remain independently hideable',
);
let triangles = 0;
let primitives = 0;
let shadedPrimitives = 0;
for (const mesh of gltf.meshes)
  for (const primitive of mesh.primitives) {
    primitives++;
    if (primitive.attributes.COLOR_0 !== undefined) shadedPrimitives++;
    const positions = gltf.accessors[primitive.attributes.POSITION];
    assert.ok(
      [...positions.min, ...positions.max].every(Number.isFinite),
      'Geometry bounds must be finite',
    );
    if ((primitive.mode ?? 4) === 4)
      triangles +=
        gltf.accessors[primitive.indices ?? primitive.attributes.POSITION]
          .count / 3;
    const material = gltf.materials[primitive.material];
    if (
      material.normalTexture ||
      material.pbrMetallicRoughness?.baseColorTexture
    ) {
      assert.ok(
        primitive.attributes.TEXCOORD_0 !== undefined,
        'Textured geometry needs exported UVs',
      );
    }
  }
assert.equal(
  shadedPrimitives,
  primitives,
  'The finished room must retain its baked vertex contact shading',
);
const result = {
  valid: true,
  bytes: buffer.length,
  nodes: gltf.nodes.length,
  meshes: gltf.meshes.length,
  primitives,
  triangles,
  materials: gltf.materials.length,
  images: gltf.images.length,
  vertexContactShading: true,
  compressedViews,
  interactiveMetadata: true,
  physicalReadingSurfaces: 4,
  externalFiles: false,
};
writeFileSync(
  new URL('../context/models/room/export-validation.json', import.meta.url),
  JSON.stringify(result, null, 2) + '\n',
);
console.log(JSON.stringify(result, null, 2));
