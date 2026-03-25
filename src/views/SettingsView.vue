<script setup>
import { settings } from '../state';
import { ZONES } from '../constants';
import SectionCard from '../components/SectionCard.vue';
import Field from '../components/Field.vue';
import DataCard from '../components/DataCard.vue';
</script>

<template>
    <div>
        <!-- Header -->
        <div class="page-header">
            <h2>Innstillinger</h2>
            <p>Tilpass BolusLab til dine behov og insulinparametere.</p>
        </div>

        <!-- Profil -->
        <SectionCard title="Profil">
            <div style="max-width: 320px">
                <Field label="Visningsnavn">
                    <input v-model="settings.userName" type="text" placeholder="Skriv inn navn..." />
                </Field>
            </div>
        </SectionCard>

        <!-- Standardverdier -->
        <SectionCard title="Standardverdier for nye tester">
            <div class="settings-grid">
                <Field label="Standard sone">
                    <select v-model="settings.defaultZone">
                        <option v-for="zone in ZONES" :key="zone.id" :value="zone.id">
                            {{ zone.label }} ({{ zone.range }})
                        </option>
                    </select>
                </Field>
                <Field label="Standard varighet (min)">
                    <input v-model.number="settings.defaultDuration" type="number" />
                </Field>
                <Field label="Mål BG (mmol/L)">
                    <input v-model.number="settings.targetBG" type="number" step="0.1" />
                </Field>
            </div>
        </SectionCard>

        <!-- Vurderingsgrenser -->
        <SectionCard title="Grenser for vurdering av Δ BG" subtitle="Brukes til farging og konsistensanalyse i Logg og Analyse">
            <div class="settings-grid">
                <Field label="God ● — grønn (mmol/L)">
                    <input v-model.number="settings.goodDelta" type="number" step="0.1" />
                    <span class="field-hint">Δ BG ≤ {{ settings.goodDelta }} mmol/L anses som godt</span>
                </Field>
                <Field label="Akseptabel ● — gul (mmol/L)">
                    <input v-model.number="settings.okDelta" type="number" step="0.1" />
                    <span class="field-hint">{{ settings.goodDelta }}–{{ settings.okDelta }} mmol/L anses som akseptabelt</span>
                </Field>
                <div class="threshold-preview">
                    <div class="threshold-preview-title">Gjeldende grenser</div>
                    <div class="threshold-row">
                        <span class="threshold-dot" style="background: #34d399"></span>
                        <span class="threshold-range">Δ ≤ {{ settings.goodDelta }}</span>
                        <span class="threshold-label" style="color: #34d399">God</span>
                    </div>
                    <div class="threshold-row">
                        <span class="threshold-dot" style="background: #fbbf24"></span>
                        <span class="threshold-range">Δ ≤ {{ settings.okDelta }}</span>
                        <span class="threshold-label" style="color: #fbbf24">Akseptabel</span>
                    </div>
                    <div class="threshold-row">
                        <span class="threshold-dot" style="background: #f87171"></span>
                        <span class="threshold-range">Δ > {{ settings.okDelta }}</span>
                        <span class="threshold-label" style="color: #f87171">Bør gjentas</span>
                    </div>
                </div>
            </div>
        </SectionCard>

        <!-- Data -->
        <DataCard />

        <div style="height: 40px"></div>
    </div>
</template>

<style scoped>
.page-header {
    margin-bottom: 24px;
}

.page-header h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 4px;
}

.page-header p {
    font-size: 13px;
    color: var(--color-text-muted);
    margin: 0;
}

.settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
}

input,
select {
    width: 100%;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 9px 12px;
    color: var(--color-text-primary);
    font-size: 13px;
    font-family: var(--font-mono);
    outline: none;
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

input:focus,
select:focus {
    border-color: rgba(56, 189, 248, 0.5);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08);
}

select {
    cursor: pointer;
}

.field-hint {
    font-size: 11px;
    color: var(--color-text-muted);
}

.threshold-preview {
    padding: 12px 14px;
    background: var(--color-bg-primary);
    border-radius: 8px;
    border: 1px solid var(--color-border);
}

.threshold-preview-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
}

.threshold-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
}

.threshold-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.threshold-range {
    font-size: 12px;
    color: #94a3b8;
    font-family: var(--font-mono);
}

.threshold-label {
    font-size: 12px;
}
</style>
