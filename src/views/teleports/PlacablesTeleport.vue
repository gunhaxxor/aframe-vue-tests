<script setup lang="ts">

import { Pane } from 'tweakpane';

import { computed, ref, onMounted, shallowReactive, reactive, shallowRef, watch, nextTick } from 'vue';
import { useEventBus } from '@vueuse/core'
import { clickKey, intersectionToTransform } from '@/composables/utils'

import { type DetailEvent, THREE, type Entity, type Scene } from 'aframe';
import PdfEntity from '@/components/PdfEntity.vue';

defineOptions({
  components: { PdfEntity },
})

function arrToCoordString(arr: Array<unknown>) {
  const constructedString = arr.join(' ');
  return constructedString;
}

function threeRotationToAframeRotation(threeRotation: THREE.Vector3Tuple): THREE.Vector3Tuple {
  return [
    THREE.MathUtils.radToDeg(threeRotation[0]),
    THREE.MathUtils.radToDeg(threeRotation[1]),
    THREE.MathUtils.radToDeg(threeRotation[2]),
  ]
}

function quaternionToAframeRotation(quaternion: THREE.Quaternion): THREE.Vector3Tuple {
  const euler = new THREE.Euler().reorder('YXZ').setFromQuaternion(quaternion);
  const arr = euler.toArray() as THREE.Vector3Tuple;
  return threeRotationToAframeRotation(arr);
}


function onClick(evt: DetailEvent<{ cursorEl: Entity, intersection: THREE.Intersection }>) {
  const rayDirection = evt.detail.cursorEl.components.raycaster.raycaster.ray.direction;
  // console.log('click!', evt);

  placeMovedObject({ intersection: evt.detail.intersection, rayDirection });
  return;
}

type UUID = ReturnType<typeof crypto.randomUUID>
type RayIntersectionData = { intersection: THREE.Intersection, rayDirection: THREE.Vector3 };
type placeableAssetTypes = `a-${'image' | 'sphere'}` | 'PdfEntity'; // | typeof PdfEntity;
type PlaceableObject = { uuid: UUID, type: placeableAssetTypes, src: string };
// type PlacedObjectList = Array<PlaceableObject & { position: THREE.Vector3Tuple, rotation: THREE.Vector3Tuple }>
type PlacedObjectList = Array<PlaceableObject & { position: THREE.Vector3, positionLocal: THREE.Vector3, rotation: THREE.Vector3Tuple }>

const currentlyMovedObject = shallowRef<PlaceableObject | undefined>();
const currentlySelectedObjectId = ref<UUID | undefined>();
// const currentlySelectedObject = ref<PlacedObjectList[number] | undefined>()
const currentlyMovedEntity = ref<Entity | null>(null);
const currentlySelectedEntity = ref<Entity | null>(null);
const placedObjects = reactive<PlacedObjectList>([
  // { type: 'PdfEntity', src: '/documents/smallpdf_sample.pdf', uuid: crypto.randomUUID(), position: [1, 1.8, -2], rotation: [0, 0, 0] },
  // { type: 'PdfEntity', src: '/documents/compressed.tracemonkey-pldi-09.pdf', uuid: crypto.randomUUID(), position: [-2, 1.8, -2], rotation: [0, 0, 0] },
]);
const currentlySelectedObject = computed(() => {
  return placedObjects.find(obj => obj.uuid === currentlySelectedObjectId.value)
})


const placedObjectsEntity = ref<Entity>();
function placeMovedObject(cursorObject: THREE.Object3D) {
  if (!currentlyMovedObject.value) return;
  const position = cursorObject.position
  const positionLocal = new THREE.Vector3()
  const rotation = quaternionToAframeRotation(cursorObject.quaternion);
  placedObjects.push({ ...currentlyMovedObject.value, position, positionLocal, rotation });
  selectEntity(currentlyMovedObject.value.uuid, undefined)
  currentlyMovedObject.value = undefined;

}

function createPlaceableObject(type: placeableAssetTypes, src: string) {
  console.log("Place photo", type, src)
  const uuid = crypto.randomUUID();
  const newPlaceableObject: PlaceableObject = {
    uuid,
    src,
    type
  }
  currentlyMovedObject.value = newPlaceableObject
}

function repositionSelectedObject() {
  const idx = placedObjects.findIndex(obj => obj.uuid === currentlySelectedObject.value?.uuid);
  if (idx < 0) return;
  const [obj] = placedObjects.splice(idx, 1);
  currentlyMovedObject.value = obj;
}

function selectEntity(uuid: UUID, evt: DetailEvent<{ cursorEl: Entity, intersection: THREE.Intersection, mouseEvent: MouseEvent }> | undefined) {
  console.log(uuid);
  console.log(evt);
  console.log("Selected entity", currentlySelectedEntity)
  currentlySelectedObjectId.value = uuid;
  updatePaneBySelected()
  nextTick(() => {
    mergeLocalAndWorldPositions()
  })
}

const paneContainer = ref(null)
const pane = ref<Pane | undefined>(undefined)
const paneParams = ref<{ 'Position': THREE.Vector3, 'Move local position': THREE.Vector3, 'Rotation': THREE.Vector3 } | undefined>(undefined)
function updatePaneBySelected() {
  pane.value?.dispose();
  pane.value = undefined
  if (paneContainer.value && currentlySelectedObject.value) {
    pane.value = new Pane({ container: paneContainer.value });
    pane.value.title = currentlySelectedObject.value.src
    paneParams.value = {
      'Position': currentlySelectedObject.value.position,
      'Move local position': currentlySelectedObject.value.positionLocal,
      'Rotation': new THREE.Vector3(currentlySelectedObject.value.rotation[0], currentlySelectedObject.value.rotation[1], currentlySelectedObject.value.rotation[2])
    };
    pane.value?.addBinding(paneParams.value, 'Position', { step: 0.01 }).on('change', (ev) => {
      if (!currentlySelectedObject.value) { return }
      currentlySelectedObject.value.position = ev.value.clone()
    });

    pane.value?.addBinding(paneParams.value, 'Move local position', { step: 0.01 }).on('change', (ev) => {
      if (!currentlySelectedObject.value) { return }
      currentlySelectedObject.value.positionLocal = ev.value.clone()
      if (ev.last) {
        mergeLocalAndWorldPositions()
      }
    });

    pane.value?.addBinding(paneParams.value, 'Rotation', { step: 1, min: -180, max: 180 }).on('change', (ev) => {
      if (!currentlySelectedObject.value) { return }
      currentlySelectedObject.value.rotation = [ev.value.x, ev.value.y, ev.value.z]
    });
  }
}

function mergeLocalAndWorldPositions() {
  if (!currentlySelectedObject.value) { return }
  if (!currentlySelectedObject.value.positionLocal.equals(new THREE.Vector3())) {
    const selectedEntity = document.getElementById(currentlySelectedObject.value.uuid) as Entity
    currentlySelectedObject.value.position = selectedEntity.object3D.localToWorld(currentlySelectedObject.value.positionLocal.clone())
    currentlySelectedObject.value.positionLocal = new THREE.Vector3()
    if (paneParams.value) {
      paneParams.value.Position = currentlySelectedObject.value.position
      paneParams.value['Move local position'] = currentlySelectedObject.value.positionLocal
      pane.value?.refresh()
    }
  }
}

const bus = useEventBus(clickKey)
const unsubscribe = bus.on((e) => {
  if (currentlySelectedObject.value) {
    currentlySelectedObjectId.value = undefined
    updatePaneBySelected()
  }
  if (e.cursorObject) {
    placeMovedObject(e.cursorObject)
  }
})


// const props = defineProps<{
// }>()

// const emit = defineEmits<{
// }>()

</script>

<template>
  <div>

    <!-- #region Place objects -->
    <Teleport to="#tp-ui-left">
      <button class="p-3 text-white rounded-md cursor-pointer bg-zinc-800"
        @click="createPlaceableObject('a-image', '/photos/joey-chacon-edbYu4vxXww-unsplash.jpg')">place photo</button>
      <button class="p-3 text-white rounded-md cursor-pointer bg-zinc-800"
        @click="createPlaceableObject('PdfEntity', '/documents/smallpdf_sample.pdf')">Place pdf</button>
      <pre class="text-xs bg-white/40">{{ currentlySelectedObject }}</pre>
      <!-- <pre class="text-xs bg-white/40">{{ placedObjects }}</pre> -->
    </Teleport>
    <!-- #endregion -->

    <!-- #region Tweakpane UI -->
    <Teleport to="#tp-ui-right">
      <div ref="paneContainer"></div>
    </Teleport>
    <!-- #endregion -->

    <Teleport to="#tp-aframe-cursor">
      <component ref="currentlyMovedEntity" v-if="currentlyMovedObject" :is="currentlyMovedObject.type"
        :src="currentlyMovedObject.src" />
    </Teleport>

    <Teleport to="#tp-aframe-scene">
      <a-entity ref="placedObjectsEntity">
        <!-- <component v-for="placedObject in placedObjects" :key="placedObject.type"
          @click="selectEntity(placedObject.uuid, $event)" class="clickable"
          :box-helper="`enabled: ${currentlySelectedObjectId === placedObject.uuid}; color: #ff00ff;`"
          :is="placedObject.type" :src="placedObject.src" :position="placedObject.position"
          :rotation="arrToCoordString(placedObject.rotation)" /> -->
        <a-entity v-for="placedObject in placedObjects" :key="placedObject.type" :position="placedObject.position"
          :rotation="arrToCoordString(placedObject.rotation)" :id="placedObject.uuid"
          :box-helper="`enabled: ${currentlySelectedObjectId === placedObject.uuid}; color: #ff00ff;`">
          <component @click="selectEntity(placedObject.uuid, $event)" class="clickable"
            :box-helper="`enabled: ${currentlySelectedObjectId === placedObject.uuid};`" :is="placedObject.type"
            :src="placedObject.src" :position="placedObject.positionLocal" />
        </a-entity>
      </a-entity>
    </Teleport>

  </div>
</template>

<style scoped></style>