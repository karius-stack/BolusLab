<script setup>
import { computed } from 'vue'

const props = defineProps({
    values: {
    type: Array,
    required: true
    },
    color: {
    type: String,
    default: '#38bdf8'
    },
    width: {
    type: Number,
    default: 120
    },
    height: {
    type: Number,
    default: 36
    }
})

// Finn min/max-verdier i dataene
const minVal = computed(() => Math.min(...props.values))
const maxVal = computed(() => Math.max(...props.values))
const range = computed(() => maxVal.value - minVal.value || 1)

// Konverterer dataverdi til SVG y-koordinat (piksler)
const toY = (v) => props.height - ((v - minVal.value) / range.value) * (props.height - 8) - 4

// Beregner alle punkt-koordinater: "0,18 60,10 120,14"
const points = computed(() =>
    props.values
    .map((v, i) => `${(i / (props.values.length - 1)) * props.width},${toY(v)}`)
    .join(' ')
)
</script>

<template>
    <svg :width="width" :height="height" style="display: block; overflow: visible;">
        <!-- Tegn linjen som kobbler alle punkt -->
        <polyline
        :points="points"
        fill="none"
        :stroke="color"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
        />
        <!-- Tegn prikk på hvert datapunkt -->
        <circle
        v-for="(v, i) in values"
        :key="i"
        :cx="(i / (values.length - 1)) * width"
        :cy="toY(v)"
        r="2"
        :fill="color"
        />
    </svg>
</template>