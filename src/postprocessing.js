import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
export function createPostprocessing(renderer, scene, camera) {
  // Print-like shadow dots and restrained chromatic edges are applied to the rendered 3D view.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const print = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
    },
    vertexShader:
      'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform sampler2D tDiffuse;uniform vec2 resolution;varying vec2 vUv;void main(){vec2 px=1./resolution;vec3 c=texture2D(tDiffuse,vUv).rgb;c.r=mix(c.r,texture2D(tDiffuse,vUv+vec2(px.x*.6,0.)).r,.3);float l=dot(c,vec3(.299,.587,.114));vec2 grid=mod(gl_FragCoord.xy,4.)/4.-.5;float dotMask=1.-smoothstep(.12,.32,length(grid));c*=1.-dotMask*.065*(1.-smoothstep(.04,.5,l));float vig=1.-.28*pow(length((vUv-.5)*1.3),2.);gl_FragColor=vec4(c*vig,1.);}`,
  });
  composer.addPass(print);
  composer.addPass(new OutputPass());
  return { composer, print };
}
