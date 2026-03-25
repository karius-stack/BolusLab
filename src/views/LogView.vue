<script setup>
import { reactive, ref } from 'vue';
import { computed } from 'vue';
import { entries, settings } from '../state';
import { TEST_TYPES, ZONES } from '../constants';
import SectionCard from '../components/SectionCard.vue';
import Field from '../components/Field.vue';
import RateCard from '../components/RateCard.vue';

const form = reactive({
    date: new Date().toISOString().slice(0, 10),
    zone: settings.defaultZone,
    testType: 'Basal',
    basalRate: '',
    startBG: '',
    endBG: '',
    duration: String(settings.defaultDuration),
    notes: ''
})

function handleSubmit() {
    //Lag ny entry og legg til i entries arrayet
    const entry = {
        id: Date.now(),
        ...form
    }
    entries.push(entry)

    // Reset form
    form.date = new Date().toISOString().slice(0, 10)
    form.zone = settings.defaultZone
    form.testType = 'Basal'
    form.basalRate = ''
    form.startBG = ''
    form.endBG = ''
    form.duration = String(settings.defaultDuration)
    form.notes = ''
}

// State
const filterType = ref('all')

const filteredEntries = computed(() => {
    // Vue sporer: filterType.value og entries
    // Hvis NOEN av disse endrer, re-kjør formelen
    if (filterType.value === 'all') return entries // Alle
    return entries.filter(e => e.testType === filterType.value) // Filtrerte
})
</script>

<template>
    <div>
        <SectionCard title="Ny test">
            <form @submit.prevent="handleSubmit">
                <Field label="Test type">
                    <select v-model="form.testType">
                        <option v-for="type in TEST_TYPES" :key="type" :value="type">
                            {{type}}
                        </option>
                    </select>
                </Field>
    
                <Field label="Dato">
                    <input v-model="form.date" type="date" />
                </Field>    

                <Field label="Sone">
                    <select v-model="form.zone">
                        <option v-for="zone in ZONES" :key="zone.id" :value="zone.id">
                            {{ zone.label }}
                        </option>
                    </select>
                </Field>

                <Field v-if="form.testType === 'Basal'" label="Basal U/t">
                    <input v-model="form.basalRate" type="number" placeholder="1.30" step="0.01" />
                </Field>

                <Field label="Start BG:">
                    <input v-model="form.startBG" type="number" placeholder="5.0" />
                </Field>

                <Field label="Slutt BG:">
                    <input v-model="form.endBG" type="number" placeholder="5.5" />
                </Field>

                <Field label="Varighet (min)">
                    <input v-model="form.duration" type="number" />                    
                </Field>

                <Field label="Notater">
                    <textarea v-model="form.notes" placeholder="Ekstra info..."></textarea>
                </Field>
    
                <button type="submit">Legg til test</button>
            </form>
        </SectionCard>

        <h3>Loggede tester ({{ filteredEntries.length }})</h3>
        <div v-if="filteredEntries.length === 0">Ingen tester ennå</div>
        <div v-else>
            <!-- Viser avledet data (oppdateres automatisk) -->
            <div v-for="entry in filteredEntries" :key="entry.id" style="border: 1px solid #334155; padding: 10px; margin: 5px;">
                <p><strong>{{ entry.testType }}</strong> - {{ entry.date }}</p>
                <p>{{ entry.startBG }} → {{ entry.endBG }} mmol/L</p>
                <p v-if="entry.notes"><em>{{ entry.notes }}</em></p>
            </div>
        </div>

        <div style="margin-bottom: 12px;">
            <button
                v-for="type in ['all', ...TEST_TYPES]"
                :key="type"
                @click="filterType = type"
                :style="{ fontWeight: filterType === type ? 'bold' : 'normal' }"
                >
                {{ type === 'all' ? 'Alle' : type }}
            </button>
        </div>
        <RateCard
            label="1.30 U/t"
            :deltas="[0.3, -0.1, 0.2, 0.1]"
            :avg="0.125"
            :dev="0.18"
            :count="4"
            :is-best="true"
            color="#34d399"
        />
    </div>
</template>

<style scoped>
form {
    max-width: 400px;
    margin-bottom: 20px;
}

div {
    margin-bottom: 12px;
}

label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin-bottom: 4px;
}

input, select, textarea {
    width: 100%;
}

button {
    background: var(--color-accent);
    color: var(--color-bg-primary);
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

button:hover {
    opacity: 0.9;
}
</style>