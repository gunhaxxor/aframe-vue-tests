<script setup lang="ts">
</script>

<template>
  <div id="tp-ui">
    <slot />
  </div>
</template>

<style scoped>
#tp-ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: none;
}

#tp-ui>* {
  display: inline-block;
  pointer-events: all;
}
</style>
