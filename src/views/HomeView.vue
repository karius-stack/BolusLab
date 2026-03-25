<script setup>
import { computed, ref, onMounted } from 'vue';
import { entries } from '../state';
import { ZONES, TEST_TYPES } from '../constants';
import ZoneBadge from '../components/ZoneBadge.vue';

const total = computed(() => entries.length)
const recent = computed(() => entries.slice(0, 3))

const byType = computed(() =>
    TEST_TYPES.reduce((acc, t) => ({ ...acc, [t]: entries.filter(e => e.testType === t).length }), {})
)

const typeColor = t => t === 'Basal' ? '#60a5fa' : t === 'ISF' ? '#c084fc' : '#34d399'
const typeLabelColor = t => t === 'Basal' ? '#93c5fd' : t === 'ISF' ? '#c084fc' : '#6ee7b7'

function deltaBG(e) {
    const s = parseFloat(e.startBG), en = parseFloat(e.endBG)
    return (!isNaN(s) && !isNaN(en)) ? en - s : null
}

function deltaBGStr(e) {
    const d = deltaBG(e)
    return d === null ? '' : `Δ ${d > 0 ? '+' : ''}${d.toFixed(1)} mmol/L`
}

function deltaColor(d) {
    if (d === null) return '#64748b'
    if (Math.abs(d) <= 0.5) return '#34d399'
    if (Math.abs(d) <= 1.2) return '#fbbf24'
    return '#f87171'
}

// ─── Counter animation ───
const animatedTotal = ref(0)
const animatedByType = ref(Object.fromEntries(TEST_TYPES.map(t => [t, 0])))

function animateCount(from, to, set, duration = 900) {
    const start = performance.now()
    const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - (1 - p) ** 3
        set(Math.round(from + (to - from) * eased))
        if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
}

onMounted(() => {
    if (total.value > 0) {
        setTimeout(() => {
            animateCount(0, total.value, v => { animatedTotal.value = v })
            TEST_TYPES.forEach(t => animateCount(0, byType.value[t], v => { animatedByType.value[t] = v }))
        }, 150)
    }
})

// ─── BG curve path (seamlessly looping) ───
// viewBox 0 0 1400 200 — starts and ends at y=100 for seamless loop
const bgPath = `M 0,100
  C 80,99 160,98 220,95
  C 280,92 320,85 365,68
  C 405,52 430,40 462,36
  C 494,32 514,31 542,35
  C 568,39 598,50 632,65
  C 664,78 692,90 730,100
  C 762,108 792,114 832,120
  C 864,124 884,126 912,122
  C 940,117 968,110 1008,104
  C 1048,99 1094,97 1145,99
  C 1190,100 1280,100 1400,100`

const bgArea = `M 0,200 L 0,100
  C 80,99 160,98 220,95
  C 280,92 320,85 365,68
  C 405,52 430,40 462,36
  C 494,32 514,31 542,35
  C 568,39 598,50 632,65
  C 664,78 692,90 730,100
  C 762,108 792,114 832,120
  C 864,124 884,126 912,122
  C 940,117 968,110 1008,104
  C 1048,99 1094,97 1145,99
  C 1190,100 1280,100 1400,100 L 1400,200 Z`

const infoCards = [
    { title: 'Basaltest', color: '#60a5fa', icon: '〰', desc: 'Tester om basaldosen holder blodsukkeret stabilt uten maten i bildet. Målet er at BG ikke beveger seg mer enn ±0.5 mmol/L i løpet av 2–4 timer.' },
    { title: 'ISF — Insulinsensitivitet', color: '#c084fc', icon: '↓', desc: 'Måler hvor mye blodsukkeret synker per enhet insulin. Brukes til å beregne korreksjonsdoser ved høyt blodsukker.' },
    { title: 'CR — Karbohydratforhold', color: '#34d399', icon: '÷', desc: 'Måler hvor mange gram karbohydrat som dekkes av én enhet insulin. Brukes ved måltidsdosering.' },
]

const steps = [
    { n: '1', t: 'Still inn parametere', d: 'Gå til Innstillinger og sett inn dine nåværende insulinverdier som referanse.' },
    { n: '2', t: 'Logg din første test', d: 'Gå til Logg og registrer en test. Fyll inn blodsukker ved start og slutt.' },
    { n: '3', t: 'Se analyse', d: 'Etter noen tester viser Analyse-siden statistikk og anbefaling per sone og testtype.' },
]
</script>

<template>
    <div class="home-wrap">

        <!-- ─── Bakgrunn: grid + BG-kurve ─── -->
        <div class="bg-layer" aria-hidden="true">
            <div class="bg-grid"></div>
            <div class="bg-curve-wrap">
                <div class="bg-curve-scroll">
                    <!-- To identiske SVG-er side om side for sømløs loop -->
                    <svg v-for="n in 2" :key="n" class="bg-svg"
                        viewBox="0 0 1400 200" preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient :id="`bgGrad${n}`" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#34d399" stop-opacity="0.08"/>
                                <stop offset="100%" stop-color="#34d399" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        <!-- Målsone (4–8 mmol/L) -->
                        <rect x="0" y="62" width="1400" height="76" fill="rgba(52,211,153,0.025)"/>
                        <!-- Fylt areal under kurven -->
                        <path :d="bgArea" :fill="`url(#bgGrad${n})`"/>
                        <!-- BG-kurve -->
                        <path :d="bgPath" fill="none" stroke="#34d399" stroke-width="1.5"
                            stroke-linejoin="round" stroke-linecap="round" opacity="0.22"/>
                    </svg>
                </div>
            </div>
        </div>

        <!-- ─── Innhold ─── -->
        <div class="home-content">

            <!-- Velkomst -->
            <div class="welcome">
                <h2 class="welcome-title">Velkommen til BolusLab</h2>
                <p class="welcome-desc">
                    Et verktøy for systematisk testing og optimalisering av insulininnstillinger i et lukket sløyfesystem.
                    Logg tester, analyser resultater og finn de beste innstillingene for din kropp.
                </p>
            </div>

            <!-- Statistikk -->
            <div v-if="total > 0" class="stat-grid">
                <div class="stat-card">
                    <div class="stat-value" style="color: #38bdf8">{{ animatedTotal }}</div>
                    <div class="stat-label">Totalt antall tester</div>
                </div>
                <div v-for="t in TEST_TYPES" :key="t" class="stat-card">
                    <div class="stat-value" :style="{ color: typeColor(t) }">{{ animatedByType[t] }}</div>
                    <div class="stat-label">{{ t }}-tester</div>
                </div>
            </div>

            <!-- Om testtypene -->
            <div class="section">
                <h3 class="section-title">Testtypene</h3>
                <div class="info-grid">
                    <div
                        v-for="card in infoCards"
                        :key="card.title"
                        class="info-card"
                        :style="{ borderColor: card.color + '25', borderTopColor: card.color }"
                    >
                        <div class="info-card-header">
                            <span class="info-icon" :style="{ color: card.color }">{{ card.icon }}</span>
                            <span class="info-card-title">{{ card.title }}</span>
                        </div>
                        <p class="info-card-desc">{{ card.desc }}</p>
                    </div>
                </div>
            </div>

            <!-- Siste aktivitet -->
            <div v-if="recent.length > 0" class="section">
                <h3 class="section-title">Siste aktivitet</h3>
                <div class="activity-list">
                    <div
                        v-for="(e, i) in recent"
                        :key="e.id"
                        class="activity-item"
                        :style="{
                            borderLeftColor: (ZONES.find(z => z.id === e.zone) ?? ZONES[0]).color,
                            animationDelay: `${i * 0.1 + 0.05}s`,
                        }"
                    >
                        <span class="activity-date">{{ e.date }}</span>
                        <ZoneBadge :zone="ZONES.find(z => z.id === e.zone) ?? ZONES[0]" />
                        <span class="activity-type" :style="{ color: typeLabelColor(e.testType) }">{{ e.testType }}</span>
                        <span
                            v-if="deltaBG(e) !== null && e.testType !== 'ISF'"
                            class="activity-delta"
                            :style="{ color: deltaColor(deltaBG(e)) }"
                        >{{ deltaBGStr(e) }}</span>
                    </div>
                </div>
            </div>

            <!-- Kom i gang -->
            <div v-if="total === 0" class="onboarding">
                <h3 class="onboarding-title">Kom i gang</h3>
                <div v-for="step in steps" :key="step.n" class="step">
                    <div class="step-number">{{ step.n }}</div>
                    <div>
                        <div class="step-title">{{ step.t }}</div>
                        <div class="step-desc">{{ step.d }}</div>
                    </div>
                </div>
            </div>

            <div style="height: 40px"></div>
        </div>
    </div>
</template>

<style scoped>
/* ─── WRAPPER ─── */
.home-wrap {
    position: relative;
}

.home-content {
    position: relative;
    z-index: 1;
}

/* ─── BAKGRUNN ─── */
.bg-layer {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
}

.bg-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(56, 189, 248, 0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56, 189, 248, 0.045) 1px, transparent 1px);
    background-size: 44px 44px;
}

.bg-curve-wrap {
    position: absolute;
    bottom: 15%;
    left: 0;
    right: 0;
    height: 200px;
    overflow: hidden;
}

/* To SVG-er side om side, animeres som én enhet */
.bg-curve-scroll {
    display: flex;
    width: 200%;
    height: 100%;
    animation: scroll-bg 28s linear infinite;
}

.bg-svg {
    width: 50%;
    height: 100%;
    flex-shrink: 0;
}

@keyframes scroll-bg {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
}

/* ─── VELKOMST ─── */
.welcome {
    margin-bottom: 28px;
}

.welcome-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 6px;
    letter-spacing: -0.02em;
}

.welcome-desc {
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.7;
    margin: 0;
    max-width: 600px;
}

/* ─── STATISTIKK ─── */
.stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    margin-bottom: 28px;
}

.stat-card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 16px 18px;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    font-family: var(--font-mono);
}

.stat-label {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-top: 2px;
}

/* ─── SEKSJONER ─── */
.section {
    margin-bottom: 28px;
}

.section-title {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 14px;
}

/* ─── INFO CARDS ─── */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
}

.info-card {
    background: var(--color-bg-secondary);
    border: 1px solid;
    border-top-width: 3px;
    border-radius: 12px;
    padding: 18px 20px;
}

.info-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.info-icon {
    font-size: 22px;
    font-family: var(--font-mono);
}

.info-card-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
}

.info-card-desc {
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.65;
    margin: 0;
}

/* ─── SISTE AKTIVITET ─── */
.activity-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.activity-item {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-left: 3px solid;
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    opacity: 0;
    animation: fade-up 0.4s ease-out forwards;
}

@keyframes fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}

.activity-date {
    font-size: 11px;
    color: #475569;
    font-family: var(--font-mono);
    min-width: 88px;
}

.activity-type {
    font-size: 12px;
    font-weight: 600;
}

.activity-delta {
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-mono);
    margin-left: auto;
}

/* ─── KOM I GANG ─── */
.onboarding {
    margin-top: 28px;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 14px;
    padding: 24px 28px;
}

.onboarding-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 16px;
}

.step {
    display: flex;
    gap: 14px;
    margin-bottom: 16px;
}

.step:last-child {
    margin-bottom: 0;
}

.step-number {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: #38bdf8;
    font-size: 12px;
    font-weight: 700;
    font-family: var(--font-mono);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.step-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 2px;
}

.step-desc {
    font-size: 12px;
    color: var(--color-text-muted);
    line-height: 1.6;
}
</style>
