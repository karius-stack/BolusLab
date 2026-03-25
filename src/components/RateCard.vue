<script setup>
import Sparkline from './Sparkline.vue';

const props = defineProps({
    label: String,
    deltas: { type: Array, default: () => [] },
    avg: { type: Number, default: null },
    dev: { type: Number, default: null },
    count: Number,
    isBest: Boolean,
    accentColor: { type: String, default: '#38bdf8' },
    good: { type: Number, default: 0.5 },
    ok: { type: Number, default: 1.2 },
})

function deltaColor(d) {
    if (d === null) return '#64748b'
    if (Math.abs(d) <= props.good) return '#34d399'
    if (Math.abs(d) <= props.ok) return '#fbbf24'
    return '#f87171'
}

function consistency(avg, dev) {
    if (avg === null || dev === null) {
        return props.count === 1 ? { label: 'Trenger flere tester', color: '#64748b' } : null
    }
    const ratio = Math.abs(avg) > 0.1 ? dev / Math.abs(avg) : dev
    if (ratio < 0.15) return { label: 'Konsistent ✓', color: '#34d399' }
    if (ratio < 0.30) return { label: 'Noe variasjon', color: '#fbbf24' }
    return { label: 'Bør gjentas', color: '#f87171' }
}
</script>

<template>
    <div
        class="rate-card"
        :style="{
            background: isBest ? `${accentColor}12` : 'var(--color-bg-primary)',
            border: `1px solid ${isBest ? accentColor + '50' : 'var(--color-border)'}`,
        }"
    >
        <div v-if="isBest" class="badge" :style="{ background: accentColor }">ANBEFALT</div>

        <div class="rate-label" :style="{ color: accentColor }">{{ label }}</div>

        <Sparkline
            v-if="deltas.length >= 2"
            :values="deltas"
            :color="deltaColor(avg)"
            :width="120"
            :height="32"
            :zero-line="true"
        />

        <div v-if="avg !== null" class="stat">
            <span class="value" :style="{ color: deltaColor(avg) }">{{ avg > 0 ? '+' : '' }}{{ avg.toFixed(2) }}</span>
            <span class="unit">mmol/L</span>
        </div>

        <div v-if="dev !== null" class="stat-small">±{{ dev.toFixed(2) }}</div>
        <div class="stat-small" style="color: #475569">{{ count }} test{{ count !== 1 ? 'er' : '' }}</div>

        <div
            v-if="consistency(avg, dev)"
            class="consistency"
            :style="{ color: consistency(avg, dev).color }"
        >{{ consistency(avg, dev).label }}</div>

        <div class="chip-row">
            <span
                v-for="(d, i) in deltas"
                :key="i"
                class="delta-chip"
                :style="{ borderColor: deltaColor(d) + '40', color: deltaColor(d) }"
            >{{ d > 0 ? '+' : '' }}{{ d.toFixed(1) }}</span>
        </div>
    </div>
</template>

<style scoped>
.rate-card {
    position: relative;
    border-radius: var(--radius-md);
    padding: 14px 16px;
    min-width: 155px;
    flex: 0 0 auto;
}

.badge {
    position: absolute;
    top: -9px;
    left: 12px;
    color: var(--color-bg-primary);
    padding: 1px 9px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
}

.rate-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    font-family: var(--font-mono);
}

.stat {
    margin-top: 8px;
    display: flex;
    align-items: baseline;
    gap: 5px;
}

.value {
    font-size: 20px;
    font-weight: 600;
    font-family: var(--font-mono);
}

.unit {
    font-size: 11px;
    color: var(--color-text-muted);
    font-family: var(--font-ui);
}

.stat-small {
    font-size: 11px;
    color: var(--color-text-muted);
    margin-top: 2px;
    font-family: var(--font-mono);
}

.consistency {
    font-size: 11px;
    font-weight: 600;
    margin-top: 6px;
}

.chip-row {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
}

.delta-chip {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
    background: #1e293b;
    border: 1px solid;
    font-family: var(--font-mono);
}
</style>
