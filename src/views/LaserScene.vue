<script setup lang="ts">
import { type Ref, ref } from 'vue';
import sponzaUrl from '@/assets/sponza.glb?url'
import { type DetailEvent, THREE, type Scene } from 'aframe';

import LaserPointerSelf from '@/components/LaserPointerSelf.vue'
import LaserPointerOther from '@/components/LaserPointerOther.vue'

const sceneTag = ref<Scene>();
const isVR = ref(false)
const laserActive = ref(false)
const cursorIntersection : Ref<THREE.Vector3> = ref(new THREE.Vector3())
const otherPosition : Ref<THREE.Vector3 | undefined> = ref(undefined)

function setIntersection(evt: DetailEvent<{ intersection: THREE.Intersection }>) {
  cursorIntersection.value = evt.detail.intersection.point
}

function setLaserActiveByOculusHandControl(evt: DetailEvent<{value: boolean}>) {
  laserActive.value = evt.detail.value
}

window.addEventListener("keydown", (event) => {
  if (event.isComposing || event.key === 'l') {
    laserActive.value = !laserActive.value
  }
});

function laserUpdate(active: boolean, position?: THREE.Vector3){
  console.log("Laser update", {active, position})
  otherPosition.value = active ? position : undefined
}

</script>

<template>
  
  <a-scene ref="sceneTag" style="width: 100vw; height: 100vh;" cursor="rayOrigin: mouse;" raycaster="objects: .clickable;" raycaster-update
    @raycast-update="setIntersection" xr-mode-ui="enabled: true;" @enter-vr="isVR = true" @exit-vr="isVR = false">
    <a-assets>
      <a-asset-item id="sponza" :src="sponzaUrl"></a-asset-item>
    </a-assets>
    
    <!-- Raycast and emit intersection points for own cursor / hand control -->
    <!-- Render as a white (inactive) or green (active) cube -->
    <LaserPointerSelf :active="laserActive" :intersection="cursorIntersection" @update="laserUpdate"/>

    <!-- Show active laser pointers from other users -->
    <!-- Render as a red sphere -->
    <LaserPointerOther :point="otherPosition"/>

    <a-entity v-if="isVR">
      <a-entity laser-controls="hand: right" raycaster="objects: .clickable" raycaster-update @raycast-update="setIntersection"></a-entity>
      <a-entity oculus-touch-controls="hand: right" laser-pointer @laser-active-toggle="setLaserActiveByOculusHandControl"></a-entity>
    </a-entity>

    <a-gltf-model class="clickable" src="#sponza" />
  </a-scene>
</template>