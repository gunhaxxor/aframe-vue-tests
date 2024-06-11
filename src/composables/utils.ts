import { ref } from 'vue';
import { THREE } from 'aframe';
import { type EventBusKey } from '@vueuse/core'

export const isVR = ref(false);

// #region Raycast & intersection

export type RayIntersectionData = { intersection: THREE.Intersection, rayDirection: THREE.Vector3 };
export const clickKey: EventBusKey<{ model: string, cursorObject: THREE.Object3D | undefined }> = Symbol('symbol-key')

export function intersectionToTransform(intersectionData: RayIntersectionData, normalOffset: number = 0.05) {
    const { intersection, rayDirection } = intersectionData;
    const position = intersection.point.clone();
    const rotation = new THREE.Quaternion();
    const normal = intersection.normal;
    if (!normal) { console.error('no normal vector in intersection object'); return; }


    //Rotation part
    const fromVector = new THREE.Vector3(0, 0, 1);
    rotation.setFromUnitVectors(fromVector, normal);
    const euler = new THREE.Euler().reorder('YXZ').setFromQuaternion(rotation);
    euler.z = 0;
    // if flat placement, align with camera direction
    if (euler.x < (-Math.PI / 2 + 0.01)) {// && euler.x > (-Math.PI / 4 - 0.01)) {
        // const quat = new THREE.Quaternion();
        // const cameraRot = sceneTag.value!.camera.getWorldQuaternion(quat);
        // const eul = new THREE.Euler().reorder('YXZ').setFromQuaternion(cameraRot);

        const quat = new THREE.Quaternion().setFromUnitVectors(fromVector, rayDirection.clone().negate());
        const eul = new THREE.Euler().reorder('YXZ').setFromQuaternion(quat);
        euler.y = eul.y;
    }
    const quat = new THREE.Quaternion().setFromEuler(euler);

    // Position part
    position.add(normal.clone().setLength(normalOffset));
    position.set(...position.toArray());
    return {
        position: position.toArray(),
        rotation: quat.toArray() as THREE.Vector4Tuple,
    }
}

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