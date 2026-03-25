import { reactive, watch } from "vue";

const KEYS = {
    entries: 'boluslab_entries',
    settings: 'boluslab_settings',
}

function load(key, fallback) {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch {
        return fallback
    }
}

export const entries = reactive(load(KEYS.entries, []))

export const settings = reactive(load(KEYS.settings, {
    userName: '',
    targetBG: 5.5,
    goodDelta: 0.5,
    okDelta: 1.2,
    defaultDuration: 120,
    defaultZone: 'morgen',
}))

watch(
    () => [...entries],
    (val) => localStorage.setItem(KEYS.entries, JSON.stringify(val)),
    { deep: true }
)

watch(
    settings,
    (val) => localStorage.setItem(KEYS.settings, JSON.stringify(val)),
    { deep: true }
)
