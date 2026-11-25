import * as THREE from 'three';
import { createExterior } from './exterior.js';
export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#111b32');
  scene.fog = new THREE.FogExp2('#141b35', 0.018);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 100);
  scene.add(camera);
  const { sash } = createExterior(scene);
  scene.add(new THREE.HemisphereLight('#9cbde9', '#382040', 0.8));
  const moon = new THREE.DirectionalLight('#709ffe', 2.8);
  moon.position.set(-5, 9, 8);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  Object.assign(moon.shadow.camera, {
    left: -12,
    right: 12,
    top: 12,
    bottom: -12,
  });
  moon.shadow.bias = -0.001;
  moon.shadow.autoUpdate = false;
  moon.shadow.needsUpdate = true;
  scene.add(moon);
  const rim = new THREE.PointLight('#f14d95', 65, 22, 2);
  rim.position.set(5, 4, 4);
  scene.add(rim);
  return { renderer, scene, camera, sash, moon };
}
