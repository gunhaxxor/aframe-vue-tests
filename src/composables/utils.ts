import { ref } from 'vue';

export const isVR = ref(false);
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
                oculusButtons.value.x = true
            }
            if (e.key === 'b') {
                oculusButtons.value.x = true
            }
            if (e.key === 'x') {
                oculusButtons.value.x = true
            }
            if (e.key === 'y') {
                oculusButtons.value.x = true
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