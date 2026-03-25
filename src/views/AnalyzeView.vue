<script setup>
import { computed } from 'vue';
import { entries, settings } from '../state';
import { ZONES } from '../constants';
import SectionCard from '../components/SectionCard.vue';
import RateCard from '../components/RateCard.vue';
import ZoneBadge from '../components/ZoneBadge.vue';
import Sparkline from '../components/Sparkline.vue';

function deltaBG(e) {
    const s = parseFloat(e.startBG), en = parseFloat(e.endBG);
    return (!isNaN(s) && !isNaN(en)) ? en - s : null;
}

function calcISF(e) {
    const s = parseFloat(e.startBG), en = parseFloat(e.endBG), dose = parseFloat(e.dose);
    return (!isNaN(s) && !isNaN(en) && !isNaN(dose) && dose > 0) ? (s - en) / dose : null;
}

function calcCR(e) {
    const carbs = parseFloat(e.carbs), dose = parseFloat(e.dose);
    return (!isNaN(carbs) && !isNaN(dose) && dose > 0) ? carbs / dose : null;
}

function crGroupKey(e) {
    const cr = calcCR(e);
    return cr !== null ? String(Math.round(cr)) : null;
}

function consistency(avg, dev) {
    if (avg === null || dev === null) return { label: '—', color: '#64748b' };
    const ratio = Math.abs(avg) > 0.1 ? dev / Math.abs(avg) : dev;
    if (ratio < 0.15) return { label: 'Konsistent ✓', color: '#34d399' };
    if (ratio < 0.30) return { label: 'Noe variasjon', color: '#fbbf24' };
    return { label: 'Bør gjentas', color: '#f87171' };
}

function makeRateGroups(zEntries, keyFn) {
    const keys = [...new Set(zEntries.map(keyFn).filter(Boolean))];
    return keys.map(k => {
        const group = zEntries.filter(e => keyFn(e) === k);
        const deltas = group.map(e => deltaBG(e)).filter(d => d !== null);
        const avg = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : null;
        const dev = deltas.length > 1
            ? Math.sqrt(deltas.map(d => (d - avg) ** 2).reduce((a, b) => a + b, 0) / deltas.length)
            : null;
        return { key: k, deltas, avg, dev, count: group.length };
    }).sort((a, b) => parseFloat(a.key) - parseFloat(b.key));
}

const basalData = computed(() => ZONES.map(z => {
    const zE = entries.filter(e => e.testType === 'Basal' && e.zone === z.id);
    const groups = makeRateGroups(zE, e => e.basalRate);
    const withAvg = groups.filter(g => g.avg !== null);
    const best = withAvg.length ? withAvg.reduce((a, b) => Math.abs(a.avg) <= Math.abs(b.avg) ? a : b) : null;
    return { zone: z, groups, best };
}));

const isfData = computed(() => ZONES.map(z => {
    const group = entries.filter(e => e.testType === 'ISF' && e.zone === z.id);
    const isfs = group.map(e => calcISF(e)).filter(v => v !== null);
    const avg = isfs.length ? isfs.reduce((a, b) => a + b, 0) / isfs.length : null;
    const dev = isfs.length > 1
        ? Math.sqrt(isfs.map(v => (v - avg) ** 2).reduce((a, b) => a + b, 0) / isfs.length)
        : null;
    return { zone: z, isfs, avg, dev, count: group.length };
}));

const crData = computed(() => ZONES.map(z => {
    const zE = entries.filter(e => e.testType === 'CR' && e.zone === z.id);
    const groups = makeRateGroups(zE, e => crGroupKey(e));
    const withAvg = groups.filter(g => g.avg !== null);
    const best = withAvg.length ? withAvg.reduce((a, b) => Math.abs(a.avg) <= Math.abs(b.avg) ? a : b) : null;
    return { zone: z, groups, best };
}));
</script>

<template>
    <div>
        <!-- Header -->
        <div class="page-header">
            <h2>Analyse</h2>
            <p>
                Basal og CR er gruppert per testet verdi.
                <span style="color: #34d399">Grønn Δ BG</span> = nær 0 = riktig innstilling.
                Merket <strong style="color: #38bdf8">ANBEFALT</strong> = lavest gjennomsnittlig avvik.
            </p>
        </div>

        <!-- BASAL -->
        <SectionCard title="Basal" subtitle="Δ BG per U/t testet — mål: Δ nær 0">
            <div class="zone-grid">
                <div
                    v-for="{ zone, groups, best } in basalData"
                    :key="zone.id"
                    class="zone-card"
                    :style="{
                        border: `1px solid ${groups.length ? zone.color + '35' : '#293548'}`,
                        opacity: groups.length ? 1 : 0.45,
                    }"
                >
                    <div class="zone-header">
                        <ZoneBadge :zone="zone" />
                        <span class="zone-range">{{ zone.range }}</span>
                    </div>
                    <div v-if="!groups.length" class="empty-label">Ingen tester</div>
                    <div v-else class="rate-list">
                        <RateCard
                            v-for="g in groups"
                            :key="g.key"
                            :label="`${g.key} U/t`"
                            :deltas="g.deltas"
                            :avg="g.avg"
                            :dev="g.dev"
                            :count="g.count"
                            :is-best="best && g.key === best.key"
                            :accent-color="zone.color"
                            :good="settings.goodDelta"
                            :ok="settings.okDelta"
                        />
                    </div>
                </div>
            </div>
        </SectionCard>

        <!-- ISF -->
        <SectionCard title="ISF" subtitle="mmol/L senket per enhet insulin">
            <div class="zone-grid">
                <template v-for="{ zone, isfs, avg, dev, count } in isfData" :key="zone.id">
                    <div v-if="!isfs.length" class="zone-card" style="border: 1px solid #293548; opacity: 0.45">
                        <ZoneBadge :zone="zone" />
                        <div class="empty-label">Ingen tester</div>
                    </div>
                    <div
                        v-else
                        class="zone-card"
                        :style="{
                            background: consistency(avg, dev).color + '08',
                            border: `1px solid ${consistency(avg, dev).color}35`,
                        }"
                    >
                        <ZoneBadge :zone="zone" />
                        <div v-if="isfs.length >= 2" style="margin-top: 10px">
                            <Sparkline :values="isfs" :color="zone.color" :width="120" :height="32" />
                        </div>
                        <div class="isf-avg">
                            <span class="isf-value">{{ avg.toFixed(1) }}</span>
                            <span class="isf-unit">mmol/L/E</span>
                        </div>
                        <div v-if="dev !== null" class="stat-small">±{{ dev.toFixed(2) }} · {{ count }} tester</div>
                        <div v-else-if="count === 1" class="stat-small">Trenger flere tester</div>
                        <div class="consistency-label" :style="{ color: consistency(avg, dev).color }">
                            {{ consistency(avg, dev).label }}
                        </div>
                        <div class="chip-row">
                            <span
                                v-for="(v, i) in isfs"
                                :key="i"
                                class="isf-chip"
                                :style="{ borderColor: zone.color + '25', color: zone.color }"
                            >{{ v.toFixed(1) }}</span>
                        </div>
                    </div>
                </template>
            </div>
        </SectionCard>

        <!-- CR -->
        <SectionCard title="CR" subtitle="Δ BG per 1:X testet — mål: Δ nær 0">
            <div class="zone-grid">
                <div
                    v-for="{ zone, groups, best } in crData"
                    :key="zone.id"
                    class="zone-card"
                    :style="{
                        border: `1px solid ${groups.length ? zone.color + '35' : '#293548'}`,
                        opacity: groups.length ? 1 : 0.45,
                    }"
                >
                    <div class="zone-header">
                        <ZoneBadge :zone="zone" />
                        <span class="zone-range">{{ zone.range }}</span>
                    </div>
                    <div v-if="!groups.length" class="empty-label">Ingen tester</div>
                    <div v-else class="rate-list">
                        <RateCard
                            v-for="g in groups"
                            :key="g.key"
                            :label="`1:${g.key}`"
                            :deltas="g.deltas"
                            :avg="g.avg"
                            :dev="g.dev"
                            :count="g.count"
                            :is-best="best && g.key === best.key"
                            :accent-color="zone.color"
                            :good="settings.goodDelta"
                            :ok="settings.okDelta"
                        />
                    </div>
                </div>
            </div>
        </SectionCard>
    </div>
</template>

<style scoped>
.page-header {
    margin-bottom: 22px;
}

.page-header h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 4px;
}

.page-header p {
    font-size: 13px;
    color: var(--color-text-muted);
    line-height: 1.6;
    margin: 0;
}

.zone-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
}

.zone-card {
    background: var(--color-bg-primary);
    border-radius: 10px;
    padding: 14px;
}

.zone-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}

.zone-range {
    font-size: 11px;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
}

.empty-label {
    font-size: 12px;
    color: var(--color-text-muted);
    font-style: italic;
    margin-top: 8px;
}

.rate-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.isf-avg {
    margin-top: 10px;
    display: flex;
    align-items: baseline;
    gap: 5px;
}

.isf-value {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text-primary);
    font-family: var(--font-mono);
}

.isf-unit {
    font-size: 11px;
    color: var(--color-text-muted);
}

.stat-small {
    font-size: 11px;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
}

.consistency-label {
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

.isf-chip {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
    background: #0f172a;
    border: 1px solid;
    font-family: var(--font-mono);
}
</style>
