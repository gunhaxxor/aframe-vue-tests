import { ref } from 'vue';
import { THREE } from 'aframe';
import { type EventBusKey } from '@vueuse/core'

export const isVR = ref(false);

// #region Raycast & intersection

export type RayIntersectionData = { intersection: THREE.Intersection, rayDirection: THREE.Vector3 };
export const rayIntersectionData = ref<RayIntersectionData | undefined>()
export const clickKey: EventBusKey<{ model: string, cursorObject: THREE.Object3D | undefined }> = Symbol('symbol-key')

// #endregion

// #region Simulate VR & hand Oculus controls on desktop
export const oculusButtons = ref({ 'a': false, 'b': false, 'x': false, 'y': false })

export const oculusHandSimulator = ref({ 'simulate': false, 'hands-active': false })
export function simulateOculus() {
    oculusHandSimulator.value.simulate = true
    oculusHandSimulator.value['hands-active'] = true
    window.onkeydown = ((e: KeyboardEvent) => {
        if (e.key === 'h') {
            oculusHandSimulator.value['hands-active'] = !oculusHandSimulator.value['hands-active']
        }
        if (oculusHandSimulator.value['hands-active']) {
            if (e.key === 'a') {
                oculusButtons.value.a = true
            }
            if (e.key === 'b') {
                oculusButtons.value.b = true
            }
            if (e.key === 'x') {
                oculusButtons.value.x = true
            }
            if (e.key === 'y') {
                oculusButtons.value.y = true
            }
        }
    })
    window.onkeyup = ((e: KeyboardEvent) => {
        if (oculusHandSimulator.value['hands-active']) {
            if (e.key === 'a') {
                oculusButtons.value.x = false
            }
            if (e.key === 'b') {
                oculusButtons.value.x = false
            }
            if (e.key === 'x') {
                oculusButtons.value.x = false
            }
            if (e.key === 'y') {
                oculusButtons.value.x = false
            }
        }
    })
}

// #endregion