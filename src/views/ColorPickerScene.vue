<script setup lang="ts">
import { type Ref, ref } from 'vue';
import sponzaUrl from '@/assets/sponza.glb?url'
import { type DetailEvent, THREE, type Scene } from 'aframe';

import UIOverlay from '@/components/UIOverlay.vue';

import {Vue3ColorPicker} from '@cyhnkckali/vue3-color-picker';
import "@cyhnkckali/vue3-color-picker/dist/style.css"

import PopUp from '@/components/PopUp.vue';
const popup = ref<InstanceType<typeof PopUp> | null>(null)

function openPopup() {
  console.log("Hej")
  // popup.value?.open()
}

const color = ref('#05d66a');

</script>

<template>
  
  <UIOverlay>
    <div class="bg-slate-100 p-10">
      <Vue3ColorPicker class="test" v-model="color" mode="solid" inputType="RGB" type="HEX" :showColorList="false" :showAlpha="false" :showEyeDrop="false" :showInputMenu="false" :showInputSet="false"/>
      <div class="bg-black text-white" :style="{'background': color}">
        {{ color }}
      </div>
    </div>

    <button class="btn" @click="popup?.toggle">Toggle colorpicker</button>
    <PopUp ref="popup">
      <!-- <button class="btn" @click="popup?.close">Close popup</button> -->
      <Vue3ColorPicker class="" v-model="color" mode="solid" inputType="RGB" type="HEX" :showColorList="false" :showAlpha="false" :showEyeDrop="false" :showInputMenu="false" :showInputSet="false"/>
    </PopUp>
    

  </UIOverlay>
  
  <a-scene ref="sceneTag" style="width: 100vw; height: 100vh;"  xr-mode-ui="enabled: true;" look>
    <a-box position="0 1.6 -2" :color="color" animation="property: rotation; to: 360, 360, 360; loop: true; dur: 100000; easing: easeInOutQuad"></a-box>
  </a-scene>
  
</template>

<style>

:focus {
  border: 2px red !important;
}

</style>