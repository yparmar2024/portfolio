import { loadSurfaceIcons } from './surface-links.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { createSceneSurfaces } from './scene-surfaces.js';

import { loadBoardLogos } from './experience-board.js';

// Blender's rear window is (-.42, 6.25). Rotate it toward the exterior at Z=0.
export async function loadRoom(scene, renderer) {
  const artwork = Promise.all([loadBoardLogos(), loadSurfaceIcons()]);
  const { scene: root } = await new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .loadAsync('/models/room-draft.glb');
  await artwork;
  root.scale.setScalar(2);
  root.rotation.y = Math.PI;
  root.position.set(-0.84, -0.8, -12.5);
  root.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
    if (object.isLight) object.intensity *= 0.012;
  });
  scene.add(root);
  root.updateMatrixWorld(true);
  const anchor = (name) => {
    const object = root.getObjectByName(name);
    if (!object) throw new Error(`Room anchor missing: ${name}`);
    return object.getWorldPosition(new THREE.Vector3());
  };
  const targets = ['About', 'Projects', 'Experience'].map((name) => ({
    name,
    point: anchor(`Target_${name}`),
    view: anchor(`View_${name}`),
  }));
  RectAreaLightUniformsLib.init();
  const windowLight = new THREE.RectAreaLight('#9fc6f5', 4.2, 3, 3.8);
  windowLight.position.set(0, 3.5, -0.6);
  windowLight.lookAt(-0.84, 1, -8);
  scene.add(windowLight);
  const fill = new THREE.RectAreaLight('#d4bba8', 0.95, 7, 4);
  fill.position.set(-0.84, 4.4, -11.8);
  fill.lookAt(-0.84, 1.5, -4);
  scene.add(fill);
  const bounce = new THREE.PointLight('#ffad6b', 16, 16);
  bounce.position.set(-2, 4.8, -6.3);
  scene.add(bounce);
  return {
    root,
    targets,
    surfaces: createSceneSurfaces(root, renderer, targets),
    overview: anchor('Room_Overview'),
    lookAt: anchor('Overview_Target'),
  };
}
