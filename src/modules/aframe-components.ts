import meshUi from "./aframe-components/mesh-ui";
import makeGltfSwappable from "./aframe-components/make-gltf-swappable";
import 'aframe'
import modelColor from './aframe-components/model-color';
import raycasterListen from "./aframe-components/raycaster-listen";
import raycasterUpdate from "./aframe-components/raycaster-update";
import laserPointer from "./aframe-components/laser-pointer";
// import 'aframe-troika-text'
// import 'https://github.com/PyryM/aframe-pano-portal/raw/master/dist/aframe-pano-portal.min.js'
// import './aframe-pano-portal';
// import gltfShadow from "./aframe-components/gltf-shadow";

let componentsRegistered = false;
export default async function registerComponents() {
  if(componentsRegistered) return;
  // await import('aframe');

  meshUi();
  modelColor();
  makeGltfSwappable();
  raycasterListen();
  raycasterUpdate();
  laserPointer();
  // gltfShadow();
  // const troika = await import('./aframe-components/troika-text');
  // troika.default();
  // await import('aframe-troika-text');
  // await import('aframe-atlas-uvs-component');
  await import('aframe-orbit-controls');
  
  componentsRegistered = true;
}