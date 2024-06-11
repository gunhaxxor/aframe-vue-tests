<script setup lang="ts">
</script>

<template>
  <div id="ui" class="flex justify-between p-2">
    <div id="tp-ui-left" class="">
      <slot name="left" />
    </div>
    <div id="tp-ui-center" class="">
      <slot name="center" />
    </div>
    <div id="tp-ui-right" class="">
      <div id="tp-tweakpane"></div>
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
#ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: none;
}

#ui>div>* {
  /* display: inline-block; */
  pointer-events: all;
}
</style>
