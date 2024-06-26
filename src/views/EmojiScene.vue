<script setup lang="ts">
import { type Ref, ref, onMounted, onUnmounted } from 'vue';
import sponzaUrl from '@/assets/sponza.glb?url'
import { type DetailEvent, THREE, type Scene } from 'aframe';
import { isVR, oculusButtons, oculusHandSimulator, simulateOculus } from '@/composables/utils'

import UIOverlay from '@/components/UIOverlay.vue';
import EmojiTeleport from '@/views/teleports/EmojiTeleport.vue'
// import EmojiPicker from '@/components/EmojiPicker.vue';
import EmojiOther from '@/components/EmojiOther.vue';
// import EmojiSelf from '@/components/EmojiSelf.vue';

import emojiSheetUrl from '@/assets/sprite-128.png';

type Tuple = [number, number]

const sceneTag = ref<Scene>();

const emojiCoordsOther = ref<Tuple | undefined>(undefined)
const emojiActiveOther = ref(false)

function setEmojiSelf(coords: Tuple, active: boolean) {
  // Send things to server
  console.log("Sending emoji stuff to server", coords, active)

  // Simulating receiving emoji data from other user. It just happens to be the same emoji you just picked yourself.
  emojiCoordsOther.value = coords
  emojiActiveOther.value = active
}

// Simulate Oculus hand controls
simulateOculus()

</script>

<template>

  <!-- Components (prefereably in @/assets/views/teleports/) can render to here using the Teleport component -->
  <!-- Example: <Teleport to="tp-ui">...</Teleport> -->
  <UIOverlay></UIOverlay>

  <!-- Components (prefereably in @/assets/views/teleports/) can render to here using the Teleport component -->
  <a-scene id="tp-aframe-scene" ref="sceneTag" style="width: 100vw; height: 100vh;"
    cursor="fuse:false; rayOrigin:mouse;" raycaster="objects: .clickable" xr-mode-ui="enabled: true;"
    @enter-vr="isVR = true" @exit-vr="isVR = false" look renderer="sortTransparentObjects: true">

    <a-assets>
      <a-asset-item id="sponza" :src="sponzaUrl"></a-asset-item>
      <a-asset-item id="hand-control-left-obj"
        src="https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-left.obj"></a-asset-item>
      <a-asset-item id="hand-control-left-mtl"
        src="https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-left.mtl"></a-asset-item>
      <a-asset-item id="hand-control-right-obj"
        src="https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-right.obj"></a-asset-item>
      <a-asset-item id="hand-control-right-mtl"
        src="https://cdn.aframe.io/controllers/oculus/oculus-touch-controller-right.mtl"></a-asset-item>


    </a-assets>

    <!-- Components (prefereably in @/assets/views/teleports/) can render to here using the Teleport component -->
    <a-entity id="tp-aframe-camera" camera="active: true" look-controls wasd-controls position="9 1.6 0"
      rotation="90 190 90">

      <!-- Simulate hands, for dev purposes when no headset is available -->
      <template v-if="oculusHandSimulator.simulate">
        <template v-if="oculusHandSimulator['hands-active']">
          <a-entity id="tp-aframe-hand-left" position="-0.4 -0.2 -0.5">
            <!-- <a-box scale="0.05 0.05 0.1" opacity="0.25"></a-box> -->
            <a-entity obj-model="obj: #hand-control-left-obj; mtl: #hand-control-left-mtl"></a-entity>
          </a-entity>
          <a-entity id="tp-aframe-hand-right" position="0.4 -0.2 -0.5">
            <!-- <a-box scale="0.05 0.05 0.1" opacity="0.25"></a-box> -->
            <a-entity obj-model="obj: #hand-control-right-obj; mtl: #hand-control-right-mtl"></a-entity>
          </a-entity>
        </template>
      </template>

    </a-entity>

    <!-- Components (prefereably in @/assets/views/teleports/) can render to here using the Teleport component -->
    <template v-if="!oculusHandSimulator.simulate">
      <a-entity id="tp-aframe-hand-left" oculus-touch-controls="hand: left" @xbuttondown="oculusButtons['x'] = true"
        @xbuttonup="oculusButtons['x'] = false" @ybuttondown="oculusButtons['y'] = true"
        @ybuttonup="oculusButtons['y'] = false"></a-entity>
      <a-entity id="tp-aframe-hand-right" oculus-touch-controls="hand: right" @abuttondown="oculusButtons['a'] = true"
        @abuttonup="oculusButtons['a'] = false" @bbuttondown="oculusButtons['b'] = true"
        @bbuttonup="oculusButtons['b'] = false"></a-entity>
    </template>

    <!-- #region Misc demo stuff -->

    <!-- Other user entity -->
    <a-entity position="10 0 -3">
      <!-- Other user's avatar -->
      <a-sphere position="0 0.9 0" scale="0.4 0.9 0.3" />
      <!-- Emoji entity -->
      <EmojiOther :sheet-url="emojiSheetUrl" :coords="emojiCoordsOther" :active="emojiActiveOther" />
    </a-entity>

    <!-- Another user entity -->
    <a-entity position="6 0 -4.5">
      <!-- Other user's avatar -->
      <a-sphere position="0 0.9 0" scale="0.4 0.9 0.3" />
      <!-- Emoji entity -->
      <EmojiOther :sheet-url="emojiSheetUrl" :coords="emojiCoordsOther" :active="emojiActiveOther" />
    </a-entity>

    <!-- endregion -->

    <a-gltf-model class="clickable" src="#sponza" />
  </a-scene>

  <!-- #region Teleports -->
  <!-- Components that can render for both screen/UI and VR, keeping all logic within the same component -->

  <EmojiTeleport :sheet-url="emojiSheetUrl" :uvs="[43, 43]"
    :coords="[[[35, 8], [36, 37], [36, 38], [15, 8], [36, 27]], [[34, 8], [2, 8], [36, 24], [36, 25], [21, 8],], [[28, 26], [28, 20], [28, 38], [3, 16], [2, 1]]]"
    @change="setEmojiSelf" :isVR="false" :columns="5" />

  <!-- #endregion -->

</template>