<script setup>
import { computed } from 'vue';
import { entries } from '../state';
import { ZONES } from '../constants';
import SectionCard from '../components/SectionCard.vue';
import RateCard from '../components/RateCard.vue';

// Beregn gjennomsnittlig delta for hver basal-rate i hver sone
const basalData = computed(() => {
    const data = {}

    ZONES.forEach(zone => {
    data[zone.id] = {}

    entries
        .filter(e => e.testType === 'Basal' && e.zone === zone.id)
        .forEach(entry => {
        const rate = entry.basalRate || 'ukjent'

        if (!data[zone.id][rate]) {
            data[zone.id][rate] = {
            rate,
            deltas: [],
            count: 0
            }
        }

        const delta = parseFloat(entry.endBG) - parseFloat(entry.startBG)
        if (!isNaN(delta)) {
            data[zone.id][rate].deltas.push(delta)
            data[zone.id][rate].count += 1
        }
        })
    })

    return data
  })

// Beregn statistikk (avg, std dev) for hver rate
function getStats(deltas) {
    if (deltas.length === 0) return { avg: null, dev: null }

    const avg = deltas.reduce((a, b) => a + b) / deltas.length
    const dev = Math.sqrt(
        deltas.reduce((sum, d) => sum + Math.pow(d - avg, 2)) / deltas.length
    )

    return { avg, dev }
}

function deltaColor(delta) {
    if (delta === null) return '#64748b'
    if (Math.abs(delta) <= 0.5) return '#34d399'  // grønn
    if (Math.abs(delta) <= 1.2) return '#fbbf24'  // gul
    return '#f87171'  // rød
}
</script>

 <template>
    <div>
        <SectionCard title="Basal" subtitle="Basalrate-testing per sone">
            <div v-for="zone in ZONES" :key="zone.id" style="margin-bottom: 24px;">
                <h4 style="color: var(--color-text-secondary); margin-bottom: 12px;">{{ zone.label }}</h4>

                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <RateCard
                    v-for="(rateData, rate) in basalData[zone.id] || {}"
                    :key="`${zone.id}-${rate}`"
                    :label="rate"
                    :deltas="rateData.deltas"
                    :avg="getStats(rateData.deltas).avg"
                    :dev="getStats(rateData.deltas).dev"
                    :count="rateData.count"
                    :color="deltaColor(getStats(rateData.deltas).avg)"
                    :is-best="false"
                    />

                    <div v-if="!basalData[zone.id] || Object.keys(basalData[zone.id]).length === 0">
                    Ingen Basal-tester for denne sonen ennå
                    </div>
                </div>
            </div>
        </SectionCard>
    </div>
</template>

 <style scoped>
h4 {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
  </style>