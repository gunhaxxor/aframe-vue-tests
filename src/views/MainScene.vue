<script setup lang="ts">
import { type Ref, ref } from 'vue';
import { type DetailEvent, THREE, type Scene } from 'aframe';
import sponzaUrl from '@/assets/sponza.glb?url'
import { isVR } from '@/composables/utils'

import UIOverlay from '@/components/UIOverlay.vue';

</script>

<template>

  <UIOverlay id="ui">
    <div class="bg-white">
      Hej UI!
    </div>
  </UIOverlay>

  <a-scene ref="sceneTag" id="aframe-scene" style="width: 100vw; height: 100vh;" xr-mode-ui="enabled: true;"
    @enter-vr="isVR = true" @exit-vr="isVR = false" look>
    <a-assets>
      <a-asset-item id="sponza" :src="sponzaUrl"></a-asset-item>
    </a-assets>
    <a-gltf-model class="clickable" src="#sponza" />
  </a-scene>
</template>