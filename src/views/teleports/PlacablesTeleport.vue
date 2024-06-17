<script setup lang="ts">

import { Pane } from 'tweakpane';

import { computed, ref, onMounted, reactive, shallowRef } from 'vue';
import { useEventBus } from '@vueuse/core'
import { clickKey } from '@/composables/utils'

import { type DetailEvent, THREE, type Entity } from 'aframe';
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

type UUID = ReturnType<typeof crypto.randomUUID>
type placeableAssetTypes = `a-${'image' | 'sphere'}` | 'PdfEntity'; // | typeof PdfEntity;
type PlaceableObject = { uuid: UUID, type: placeableAssetTypes, src: string };
type PlacedObjectList = Array<PlaceableObject & { scale: number, position: THREE.Vector3, positionLocal: THREE.Vector3, rotation: THREE.Vector3Tuple }>

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
  const scale = 1;
  const position = cursorObject.position
  const positionLocal = new THREE.Vector3()
  const rotation = quaternionToAframeRotation(cursorObject.quaternion);
  placedObjects.push({ ...currentlyMovedObject.value, scale, position, positionLocal, rotation });
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

function removeSelectedObject() {
  if (!currentlySelectedObject.value) { return }
  removeObject(currentlySelectedObject.value.uuid)
  currentlySelectedObjectId.value = undefined
}

function removeObject(uuid: UUID) {
  const idx = placedObjects.findIndex(obj => obj.uuid === uuid);
  if (idx < 0) return;
  placedObjects.splice(idx, 1);
  updatePaneSelected()
}

function selectEntity(uuid: UUID, evt: DetailEvent<{ cursorEl: Entity, intersection: THREE.Intersection, mouseEvent: MouseEvent }> | undefined) {
  console.log(uuid);
  console.log(evt);
  console.log("Selected entity", currentlySelectedEntity)
  currentlySelectedObjectId.value = uuid;
  updatePaneSelected()
}

const paneContainer = ref(null)
type PaneParams = { 'scale': number, 'positionGlobal': THREE.Vector3, 'positionLocal': THREE.Vector3, 'rotation': THREE.Vector3 }
const pane = ref<Pane | undefined>()
const paneParams = ref<PaneParams | undefined>()

function initPaneCreate() {
  if (paneContainer.value) {

    const p = new Pane({ container: paneContainer.value })
    p.title = "Objects in scene"

    p.addButton({
      title: 'Add image',
    }).on('click', () => {
      createPlaceableObject('a-image', '/photos/joey-chacon-edbYu4vxXww-unsplash.jpg')
    });

    p.addButton({
      title: 'Add PDF',
    }).on('click', () => {
      createPlaceableObject('PdfEntity', '/documents/smallpdf_sample.pdf')
    });
  }
}

function updatePaneSelected() {

  if (pane.value) {
    pane.value.dispose()
    pane.value = undefined
  }

  if (paneContainer.value) {
    const obj = currentlySelectedObject.value
    if (obj) {

      pane.value = new Pane({ container: paneContainer.value });
      pane.value.title = "Selected: " + obj.src

      paneParams.value = {
        'scale': obj.scale,
        'positionGlobal': obj.position,
        'positionLocal': obj.positionLocal,
        'rotation': new THREE.Vector3(obj.rotation[0], obj.rotation[1], obj.rotation[2])
      }

      // const fProperties = pane.value.addFolder({
      //   title: 'Properties',
      // });

      pane.value.addBinding(paneParams.value, 'scale', { label: 'Scale', step: 0.01 }).on('change', (ev) => {
        if (!currentlySelectedObject.value) { return }
        currentlySelectedObject.value.scale = ev.value
      });

      pane.value.addBlade({
        view: 'separator',
      });

      pane.value.addBinding(paneParams.value, 'positionGlobal', { label: 'Global position', step: 0.025 }).on('change', (ev) => {
        if (!currentlySelectedObject.value) { return }
        currentlySelectedObject.value.position = ev.value.clone()
      });

      pane.value.addBinding(paneParams.value, 'positionLocal', { label: 'Local position (fine tune)', step: 0.01 }).on('change', (ev) => {
        if (!currentlySelectedObject.value) { return }
        currentlySelectedObject.value.positionLocal = ev.value.clone()
        if (ev.last) {
          mergeLocalAndWorldPositions()
        }
      });

      pane.value.addButton({
        label: 'Reposition in scene',   // optional
        title: 'Reposition',
      }).on('click', () => {
        repositionSelectedObject()
      });

      pane.value.addBlade({
        view: 'separator',
      });

      pane.value.addBinding(paneParams.value, 'rotation', { label: 'Rotation', step: 1, min: -180, max: 180 }).on('change', (ev) => {
        if (!currentlySelectedObject.value) { return }
        currentlySelectedObject.value.rotation = [ev.value.x, ev.value.y, ev.value.z]
      });

      // const fRemove = pane.value.addFolder({
      //   title: 'Remove',
      // });

      pane.value.addBlade({
        view: 'separator',
      });
      pane.value.addButton({
        label: 'Remove object from scene',   // optional
        title: 'Remove',
      }).on('click', () => {
        removeObject(obj.uuid)
      });

      pane.value.addBlade({
        view: 'separator',
      });

    }
  }
}

function mergeLocalAndWorldPositions() {
  if (!currentlySelectedObject.value) { return }
  if (!currentlySelectedObject.value.positionLocal.equals(new THREE.Vector3())) {
    const selectedEntity = document.getElementById(currentlySelectedObject.value.uuid) as Entity
    currentlySelectedObject.value.position = selectedEntity.object3D.localToWorld(currentlySelectedObject.value.positionLocal.clone())
    currentlySelectedObject.value.positionLocal = new THREE.Vector3()
    if (paneParams.value) {
      paneParams.value['positionGlobal'] = currentlySelectedObject.value.position
      paneParams.value['positionLocal'] = currentlySelectedObject.value.positionLocal
      pane.value?.refresh()
    }
  }
}

const bus = useEventBus(clickKey)
const unsubscribe = bus.on((e) => {
  if (currentlySelectedObject.value) {
    currentlySelectedObjectId.value = undefined
    updatePaneSelected()
  }
  if (e.cursorObject) {
    placeMovedObject(e.cursorObject)
  }
})

onMounted(() => {
  initPaneCreate()
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
      <!-- <pre class="text-xs bg-white/40">{{ currentlySelectedObject }}</pre> -->
      <!-- <pre class="text-xs bg-white/40">{{ placedObjects }}</pre> -->
    </Teleport>
    <!-- #endregion -->

    <!-- #region Tweakpane UI -->
    <Teleport to="#tp-ui-right">
      <div id="paneContainer" ref="paneContainer" class="flex flex-col gap-1">
        <div id="pane1" />
        <div id="pane2" />
      </div>
    </Teleport>
    <!-- #endregion -->

    <Teleport to="#tp-aframe-cursor">
      <component ref="currentlyMovedEntity" v-if="currentlyMovedObject" :is="currentlyMovedObject.type"
        :src="currentlyMovedObject.src" />
    </Teleport>

    <Teleport to="#tp-aframe-scene">
      <a-entity ref="placedObjectsEntity">
        <a-entity v-for="placedObject in placedObjects" :key="placedObject.type"
          :scale="`${placedObject.scale} ${placedObject.scale} ${placedObject.scale}`" :position="placedObject.position"
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

<style scoped>
#paneContainer>* {
  display: inline-block;
}
</style>