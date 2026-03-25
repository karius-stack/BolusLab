<script setup>
import { computed, ref, onMounted } from 'vue';
import { entries } from '../state';
import { ZONES, TEST_TYPES } from '../constants';
import ZoneBadge from '../components/ZoneBadge.vue';
import BgChart from '../components/BgChart.vue';

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

// Counter animation
const animatedTotal = ref(0)
const animatedByType = ref(Object.fromEntries(TEST_TYPES.map(t => [t, 0])))

function animateCount(from, to, set, duration = 900) {
    const start = performance.now()
    const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        set(Math.round(from + (to - from) * (1 - (1 - p) ** 3)))
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

const infoCards = [
    { title: 'Basaltest', color: '#60a5fa', icon: '〰', desc: 'Tester om basaldosen holder blodsukkeret stabilt. Mål: Δ BG ≤ 0.5 mmol/L over 2–4 timer uten mat.' },
    { title: 'ISF', color: '#c084fc', icon: '↓', desc: 'Insulinsensitivitetsfaktor — hvor mye BG synker per enhet insulin. Grunnlag for korreksjonsdosering.' },
    { title: 'CR', color: '#34d399', icon: '÷', desc: 'Karbohydratforhold — gram karbohydrat per enhet insulin. Avgjørende for presis måltidsdosering.' },
]

const steps = [
    { n: '1', t: 'Innstillinger', d: 'Sett inn dine nåværende insulinverdier som referanse.' },
    { n: '2', t: 'Logg tester', d: 'Registrer tester med start- og slutt-BG.' },
    { n: '3', t: 'Se analyse', d: 'Få statistikk og anbefalinger per sone.' },
]
</script>

<template>
    <div class="home-wrap">

        <!-- ─── Innhold ─── -->
        <div class="home-content">

            <!-- HERO -->
            <div class="hero">
                <div class="hero-left">
                    <div class="hero-eyebrow">Insulintesting · Sløyfesystem</div>
                    <h1 class="hero-title">Finn dine riktige<br>insulininnstillinger</h1>
                    <p class="hero-desc">
                        Systematisk logging og analyse av basalrate, ISF og CR.
                        Datadrevet grunnlag for bedre glykemisk kontroll.
                    </p>

                    <!-- Stats inline (kun når data finnes) -->
                    <div v-if="total > 0" class="hero-stats">
                        <div class="hero-stat">
                            <span class="hero-stat-num" style="color: #38bdf8">{{ animatedTotal }}</span>
                            <span class="hero-stat-label">tester</span>
                        </div>
                        <div class="hero-stat-divider"></div>
                        <div v-for="t in TEST_TYPES" :key="t" class="hero-stat">
                            <span class="hero-stat-num" :style="{ color: typeColor(t) }">{{ animatedByType[t] }}</span>
                            <span class="hero-stat-label">{{ t }}</span>
                        </div>
                    </div>

                    <!-- Onboarding (kun uten data) -->
                    <div v-else class="hero-steps">
                        <div v-for="step in steps" :key="step.n" class="hero-step">
                            <div class="hero-step-n">{{ step.n }}</div>
                            <div>
                                <div class="hero-step-title">{{ step.t }}</div>
                                <div class="hero-step-desc">{{ step.d }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BG chart -->
                <BgChart />
            </div>

            <!-- DIVIDER -->
            <div class="section-divider"></div>

            <!-- TESTTYPENE -->
            <div class="types-section">
                <div class="types-header">Testtypene</div>
                <div class="types-grid">
                    <div v-for="card in infoCards" :key="card.title" class="type-item"
                        :style="{ borderLeftColor: card.color }">
                        <div class="type-top">
                            <span class="type-icon" :style="{ color: card.color }">{{ card.icon }}</span>
                            <span class="type-name" :style="{ color: card.color }">{{ card.title }}</span>
                        </div>
                        <p class="type-desc">{{ card.desc }}</p>
                    </div>
                </div>
            </div>

            <!-- SISTE AKTIVITET -->
            <div v-if="recent.length > 0" class="activity-section">
                <div class="activity-header">Siste aktivitet</div>
                <div class="activity-list">
                    <div v-for="(e, i) in recent" :key="e.id" class="activity-row"
                        :style="{ animationDelay: `${i * 0.08 + 0.05}s` }">
                        <span class="act-date">{{ e.date }}</span>
                        <ZoneBadge :zone="ZONES.find(z => z.id === e.zone) ?? ZONES[0]" />
                        <span class="act-type" :style="{ color: typeLabelColor(e.testType) }">{{ e.testType }}</span>
                        <span class="act-delta" v-if="deltaBG(e) !== null && e.testType !== 'ISF'"
                            :style="{ color: deltaColor(deltaBG(e)) }">{{ deltaBGStr(e) }}</span>
                    </div>
                </div>
            </div>

            <div style="height: 48px"></div>
        </div>
    </div>
</template>

<style scoped>
/* ─── HERO ─── */
.hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
    padding: 24px 0 48px;
    min-height: 320px;
}

.hero-eyebrow {
    font-size: 11px;
    font-weight: 600;
    color: #38bdf8;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 14px;
}

.hero-title {
    font-size: 36px;
    font-weight: 800;
    color: var(--color-text-primary);
    line-height: 1.15;
    letter-spacing: -0.03em;
    margin: 0 0 16px;
}

.hero-desc {
    font-size: 14px;
    color: #64748b;
    line-height: 1.75;
    margin: 0 0 28px;
    max-width: 420px;
}

/* Stats row */
.hero-stats {
    display: flex;
    align-items: center;
    gap: 20px;
}

.hero-stat {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.hero-stat-num {
    font-size: 26px;
    font-weight: 700;
    font-family: var(--font-mono);
    line-height: 1;
}

.hero-stat-label {
    font-size: 11px;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.hero-stat-divider {
    width: 1px;
    height: 28px;
    background: #293548;
}

/* Onboarding steps */
.hero-steps {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.hero-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.hero-step-n {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1px solid rgba(56, 189, 248, 0.3);
    background: rgba(56, 189, 248, 0.1);
    color: #38bdf8;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--font-mono);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
}

.hero-step-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
}

.hero-step-desc {
    font-size: 12px;
    color: #475569;
    margin-top: 1px;
    line-height: 1.5;
}

/* ─── DIVIDER ─── */
.section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #1e293b 20%, #1e293b 80%, transparent);
    margin: 0 0 40px;
}

/* ─── TESTTYPENE ─── */
.types-header {
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 16px;
}

.types-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.type-item {
    padding: 16px 18px;
    border-left: 3px solid;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 0 8px 8px 0;
    border-top: 1px solid #1e293b;
    border-right: 1px solid #1e293b;
    border-bottom: 1px solid #1e293b;
}

.type-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.type-icon {
    font-size: 18px;
    font-family: var(--font-mono);
    line-height: 1;
}

.type-name {
    font-size: 13px;
    font-weight: 700;
}

.type-desc {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.65;
    margin: 0;
}

/* ─── SISTE AKTIVITET ─── */
.activity-section {
    margin-top: 40px;
}

.activity-header {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 12px;
}

.activity-list {
    display: flex;
    flex-direction: column;
}

.activity-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 0;
    border-bottom: 1px solid #1a2b3c;
    opacity: 0;
    animation: fade-up 0.35s ease-out forwards;
}

.activity-row:last-child {
    border-bottom: none;
}

@keyframes fade-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}

.act-date {
    font-size: 12px;
    color: #94a3b8;
    font-family: var(--font-mono);
    min-width: 90px;
}

.act-type {
    font-size: 12px;
    font-weight: 600;
}

.act-delta {
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-mono);
    margin-left: auto;
}
</style>
