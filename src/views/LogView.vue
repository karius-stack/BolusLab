<script setup>
import { reactive, ref, computed } from 'vue'
import { entries, settings } from '../state'
import { TEST_TYPES, ZONES } from '../constants'
import SectionCard from '../components/SectionCard.vue'
import Field from '../components/Field.vue'
import ZoneBadge from '../components/ZoneBadge.vue'
import Chip from '../components/Chip.vue'

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  zone: settings.defaultZone,
  testType: 'Basal',
  basalRate: '',
  startBG: '',
  endBG: '',
  duration: String(settings.defaultDuration),
  dose: '',
  carbs: '',
  notes: ''
})

const filterType = ref('all')
const filterZone = ref('all')
const editId = ref(null)

// Beregn delta BG
function deltaBG(e) {
  const s = parseFloat(e.startBG)
  const en = parseFloat(e.endBG)
  return !isNaN(s) && !isNaN(en) ? en - s : null
}

function deltaBGStr(e) {
  const d = deltaBG(e)
  return d === null ? '' : `Δ ${d > 0 ? '+' : ''}${d.toFixed(1)} mmol/L`
}

// Beregn ISF
function calcISF(e) {
  const s = parseFloat(e.startBG)
  const en = parseFloat(e.endBG)
  const dose = parseFloat(e.dose)
  return !isNaN(s) && !isNaN(en) && !isNaN(dose) && dose > 0 ? (s - en) / dose : null
}

// Beregn CR (for badges)
function crGroupKey(e) {
  const carbs = parseFloat(e.carbs)
  const dose = parseFloat(e.dose)
  return !isNaN(carbs) && !isNaN(dose) && dose > 0 ? String(Math.round(carbs / dose)) : null
}

// Farge basert på delta
function deltaColor(d, good = 0.5, ok = 1.2) {
  if (d === null) return '#64748b'
  if (Math.abs(d) <= good) return '#34d399'
  if (Math.abs(d) <= ok) return '#fbbf24'
  return '#f87171'
}

// Farger for test type knappene
function getTestTypeColor(type) {
  if (type === 'Basal') return '#93c5fd'
  if (type === 'ISF') return '#c084fc'
  return '#6ee7b7' // CR
}

function getTestTypeBg(type) {
  if (type === 'Basal') return 'rgba(147,197,253,0.1)'
  if (type === 'ISF') return 'rgba(192,132,252,0.1)'
  return 'rgba(110,231,183,0.1)' // CR
}

function getTestTypeBorder(type) {
  if (type === 'Basal') return 'rgba(147,197,253,0.3)'
  if (type === 'ISF') return 'rgba(192,132,252,0.3)'
  return 'rgba(110,231,183,0.3)' // CR
}

// Live preview for form
const previewDelta = computed(() => {
  const s = parseFloat(form.startBG)
  const en = parseFloat(form.endBG)
  if (!isNaN(s) && !isNaN(en)) return en - s
  return null
})

const previewISF = computed(() => {
  if (form.testType !== 'ISF') return null
  const s = parseFloat(form.startBG)
  const en = parseFloat(form.endBG)
  const dose = parseFloat(form.dose)
  return !isNaN(s) && !isNaN(en) && !isNaN(dose) && dose > 0 ? (s - en) / dose : null
})

// Filtrer entries
const filteredEntries = computed(() => {
  return entries.filter(e => {
    const typeMatch = filterType.value === 'all' || e.testType === filterType.value
    const zoneMatch = filterZone.value === 'all' || e.zone === filterZone.value
    return typeMatch && zoneMatch
  })
})

function handleSubmit() {
  if (editId.value) {
    // Update existing entry
    const idx = entries.findIndex(e => e.id === editId.value)
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], ...form }
    }
  } else {
    // Add new entry
    entries.push({
      id: Date.now(),
      ...form
    })
  }

  resetForm()
}

function resetForm() {
  form.date = new Date().toISOString().slice(0, 10)
  form.zone = settings.defaultZone
  form.testType = 'Basal'
  form.basalRate = ''
  form.startBG = ''
  form.endBG = ''
  form.duration = String(settings.defaultDuration)
  form.dose = ''
  form.carbs = ''
  form.notes = ''
  editId.value = null
}

function handleEdit(entry) {
  Object.assign(form, entry)
  editId.value = entry.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleDelete(id) {
  if (confirm('Slett denne testen?')) {
    const idx = entries.findIndex(e => e.id === id)
    if (idx >= 0) {
      entries.splice(idx, 1)
    }
  }
}
</script>

<template>
  <div class="log-page">
    <!-- VENSTRE: Form -->
    <div class="log-left">
      <SectionCard class="form-card">
        <template #header>
          <div class="form-header">
            <h2 class="form-title" :style="{ color: editId ? '#38bdf8' : 'var(--color-text-muted)' }">
              {{ editId ? 'Rediger test' : 'Ny test' }}
            </h2>
            <span v-if="editId" class="edit-badge">REDIGERER</span>
          </div>
        </template>

        <form @submit.prevent="handleSubmit" class="log-form">
          <!-- Test type buttons -->
          <div class="form-section">
            <label class="form-label">Testtype</label>
            <div class="test-type-buttons">
              <button
                v-for="type in TEST_TYPES"
                :key="type"
                type="button"
                class="test-type-btn"
                :style="{
                  borderColor: form.testType === type ? getTestTypeBorder(type) : 'var(--color-bg-hover)',
                  backgroundColor: form.testType === type ? getTestTypeBg(type) : 'transparent',
                  color: form.testType === type ? getTestTypeColor(type) : 'var(--color-text-muted)',
                  fontWeight: form.testType === type ? '700' : '600'
                }"
                @click="form.testType = type"
              >
                {{ type }}
              </button>
            </div>
          </div>

          <!-- Form fields grid -->
          <div class="form-grid">
            <Field label="Dato">
              <input v-model="form.date" type="date" />
            </Field>

            <Field label="Sone">
              <select v-model="form.zone">
                <option v-for="zone in ZONES" :key="zone.id" :value="zone.id">
                  {{ zone.label }} ({{ zone.range }})
                </option>
              </select>
            </Field>

            <Field v-if="form.testType === 'Basal'" label="Basal U/t (testet)">
              <input v-model="form.basalRate" type="number" step="0.05" placeholder="1.30" />
            </Field>

            <Field label="Start BG (mmol/L)">
              <input v-model="form.startBG" type="number" step="0.1" placeholder="5.5" />
            </Field>

            <Field v-if="form.testType !== 'Basal'" label="Slutt BG (mmol/L)">
              <input v-model="form.endBG" type="number" step="0.1" placeholder="5.2" />
            </Field>

            <Field label="Varighet (min)">
              <input v-model="form.duration" type="number" placeholder="120" />
            </Field>

            <Field v-if="form.testType === 'ISF'" label="Korreksjonsdose (E)">
              <input v-model="form.dose" type="number" step="0.1" placeholder="1.0" />
            </Field>

            <Field v-if="form.testType === 'CR'" label="Bolus (E)">
              <input v-model="form.dose" type="number" step="0.1" placeholder="4.0" />
            </Field>

            <Field v-if="form.testType === 'CR'" label="Karbohydrat (g)">
              <input v-model="form.carbs" type="number" placeholder="60" />
            </Field>
          </div>

          <!-- Notes -->
          <Field label="Notater">
            <textarea v-model="form.notes" placeholder="Feltbetingelser, avvik, vurdering..." rows="2"></textarea>
          </Field>

          <!-- Live preview -->
          <div v-if="previewDelta !== null || previewISF !== null" class="live-preview">
            <span class="preview-label">Forhåndsvisning</span>
            <div v-if="previewDelta !== null && form.testType !== 'ISF'" class="preview-item" :style="{ borderColor: deltaColor(previewDelta), backgroundColor: deltaColor(previewDelta) + '12' }">
              <span class="preview-name">Δ BG</span>
              <strong class="preview-value" :style="{ color: deltaColor(previewDelta) }">
                {{ previewDelta > 0 ? '+' : '' }}{{ previewDelta.toFixed(1) }} mmol/L
              </strong>
            </div>
            <div v-if="previewISF !== null" class="preview-item" style="border-color: #c084fc; background-color: rgba(192,132,252,0.12)">
              <span class="preview-name">ISF</span>
              <strong class="preview-value" style="color: #c084fc">
                ≈ {{ previewISF.toFixed(1) }} mmol/L/E
              </strong>
            </div>
          </div>

          <!-- Buttons -->
          <div class="form-buttons">
            <button type="submit" class="submit-btn">
              {{ editId ? 'Lagre endringer' : 'Legg til test' }}
            </button>
            <button v-if="editId" type="button" class="cancel-btn" @click="resetForm">
              Avbryt
            </button>
          </div>
        </form>
      </SectionCard>
    </div>

    <!-- HØYRE: History -->
    <div class="log-right">
      <!-- Header -->
      <div class="history-header">
        <h2>
          Testhistorikk
          <span v-if="entries.length > 0" class="history-count">
            ({{ filteredEntries.length }}/{{ entries.length }})
          </span>
        </h2>
      </div>

      <!-- Filters -->
      <div class="filter-section">
        <div class="filter-row">
          <Chip
            v-for="type in ['Alle', ...TEST_TYPES]"
            :key="type"
            :label="type"
            :active="filterType === (type === 'Alle' ? 'all' : type)"
            color="#38bdf8"
            @toggle="filterType = type === 'Alle' ? 'all' : type"
          />
          <div class="filter-divider"></div>
          <Chip
            label="Alle"
            :active="filterZone === 'all'"
            color="#38bdf8"
            @toggle="filterZone = 'all'"
          />
          <Chip
            v-for="zone in ZONES"
            :key="zone.id"
            :label="zone.label"
            :active="filterZone === zone.id"
            :color="zone.color"
            @toggle="filterZone = zone.id"
          />
        </div>
      </div>

      <!-- Entries list -->
      <div v-if="filteredEntries.length === 0" class="empty-state">
        <div class="empty-icon">○</div>
        <div class="empty-text">
          {{ entries.length === 0 ? 'Ingen tester registrert ennå' : 'Ingen tester matcher filteret' }}
        </div>
        <div v-if="entries.length === 0" class="empty-hint">
          Fyll ut skjemaet til venstre for å legge til en test
        </div>
      </div>

      <div v-else class="entries-list">
        <div
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="entry-item"
          :style="{ borderLeftColor: ZONES.find(z => z.id === entry.zone)?.color }"
        >
          <div class="entry-left">
            <div class="entry-date">{{ entry.date }}</div>
            <ZoneBadge :zone="ZONES.find(z => z.id === entry.zone)" />
          </div>

          <div class="entry-main">
            <div class="entry-type-row">
              <span class="entry-type">{{ entry.testType }}</span>

              <span v-if="entry.testType === 'Basal' && entry.basalRate" class="entry-badge basal-badge">
                {{ entry.basalRate }} U/t
              </span>
              <span v-if="entry.testType === 'CR' && crGroupKey(entry)" class="entry-badge cr-badge">
                1:{{ crGroupKey(entry) }}
              </span>
              <span v-if="entry.testType === 'ISF' && entry.dose" class="entry-badge isf-badge">
                {{ entry.dose }} E
              </span>
            </div>

            <div class="entry-bg">
              {{ entry.startBG }}
              <span v-if="entry.endBG"> → {{ entry.endBG }} mmol/L</span>
              <span v-if="entry.duration"> · {{ entry.duration }} min</span>
            </div>

            <div v-if="entry.notes" class="entry-notes">{{ entry.notes }}</div>
          </div>

          <div class="entry-stats">
            <div
              v-if="entry.testType !== 'ISF' && deltaBG(entry) !== null"
              class="delta-badge"
              :style="{ color: deltaColor(deltaBG(entry)), borderColor: deltaColor(deltaBG(entry)), backgroundColor: deltaColor(deltaBG(entry)) + '12' }"
            >
              {{ deltaBGStr(entry) }}
            </div>
            <div
              v-if="entry.testType === 'ISF' && calcISF(entry) !== null"
              class="isf-stat-badge"
            >
              ISF {{ calcISF(entry).toFixed(1) }}
            </div>
          </div>

          <div class="entry-actions">
            <button class="action-btn edit-btn" @click="handleEdit(entry)">Rediger</button>
            <button class="action-btn delete-btn" @click="handleDelete(entry.id)">Slett</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── LAYOUT ─── */
.log-page {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.log-left {
  width: 42%;
  flex-shrink: 0;
}

.log-right {
  width: 58%;
  flex-grow: 1;
}

.form-card {
  position: sticky;
  top: 80px;
  z-index: 10;
}

/* ─── FORM HEADER ─── */
.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.form-title {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.edit-badge {
  font-size: 10px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  color: #38bdf8;
  padding: 2px 10px;
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

/* ─── FORM ─── */
.log-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-section {
  margin-bottom: 6px;
}

.form-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.07em;
  margin-bottom: 8px;
}

.test-type-buttons {
  display: flex;
  gap: 7px;
}

.test-type-btn {
  flex: 1;
  padding: 9px 6px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-bg-hover);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-ui);
  cursor: pointer;
  transition: all var(--transition-base);
}

.test-type-btn:hover {
  transform: translateY(-1px);
}

.test-type-btn.active {
  border-color: var(--color-accent);
  background: rgba(56, 189, 248, 0.1);
  color: var(--color-accent);
  font-weight: 700;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 12px 0;
}

/* ─── INPUTS ─── */
input,
select,
textarea {
  width: 100%;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  font-family: var(--font-ui);
  font-size: 14px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: rgba(56, 189, 248, 0.6);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
}

select {
  cursor: pointer;
}

textarea {
  resize: vertical;
}

/* ─── LIVE PREVIEW ─── */
.live-preview {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 9px;
  background: #0f172a;
  border: 1px solid #293548;
}

.preview-label {
  font-size: 10px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid;
}

.preview-name {
  font-size: 11px;
  color: #475569;
}

.preview-value {
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-mono);
}

/* ─── BUTTONS ─── */
.form-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.submit-btn {
  flex: 1;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  padding: 10px 22px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 13px;
  font-family: var(--font-ui);
  cursor: pointer;
  transition: all var(--transition-base);
}

.submit-btn:hover {
  background: rgba(56, 189, 248, 0.18);
  transform: translateY(-1px);
}

.cancel-btn {
  background: transparent;
  border: 1px solid #293548;
  color: #64748b;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 13px;
  font-family: var(--font-ui);
  cursor: pointer;
  transition: all var(--transition-base);
}

.cancel-btn:hover {
  border-color: var(--color-border-hover);
  color: #94a3b8;
}

/* ─── HISTORY HEADER ─── */
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.history-header h2 {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #64748b;
}

.history-count {
  color: #475569;
}

/* ─── FILTERS ─── */
.filter-section {
  margin-bottom: 14px;
}

.filter-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-divider {
  width: 1px;
  height: 18px;
  background: #293548;
  margin: 0 3px;
}

/* ─── ENTRIES LIST ─── */
.entries-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.empty-icon {
  font-size: 24px;
  color: var(--color-border);
  margin-bottom: 10px;
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.empty-hint {
  font-size: 12px;
  color: #475569;
  margin-top: 4px;
}

.entry-item {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-left: 3px solid;
  border-radius: 11px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  transition: all var(--transition-base);
}

.entry-item:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.entry-left {
  min-width: 82px;
}

.entry-date {
  font-size: 11px;
  color: #475569;
  margin-bottom: 5px;
  font-family: var(--font-mono);
}

.entry-main {
  flex: 1;
  min-width: 120px;
}

.entry-type-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 3px;
  flex-wrap: wrap;
}

.entry-type {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-text-primary);
}

.entry-badge {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 4px;
  font-family: var(--font-mono);
}

.basal-badge {
  background: rgba(96, 165, 250, 0.12);
  color: #60a5fa;
}

.cr-badge {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
}

.isf-badge {
  background: rgba(192, 132, 252, 0.1);
  color: #c084fc;
}

.entry-bg {
  font-size: 12px;
  color: #64748b;
  font-family: var(--font-mono);
}

.entry-notes {
  font-size: 11px;
  color: #475569;
  margin-top: 3px;
  font-style: italic;
}

.entry-stats {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.delta-badge,
.isf-stat-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid;
  white-space: nowrap;
  font-family: var(--font-mono);
}

.isf-stat-badge {
  color: #c084fc;
  background: rgba(192, 132, 252, 0.1);
  border-color: rgba(192, 132, 252, 0.22);
}

.entry-actions {
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.entry-item:hover .entry-actions {
  opacity: 1;
}

.action-btn {
  background: transparent;
  border: 1px solid #293548;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: var(--font-ui);
  transition: all var(--transition-fast);
}

.edit-btn {
  color: #38bdf8;
}

.edit-btn:hover {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

.delete-btn {
  color: #f87171;
}

.delete-btn:hover {
  border-color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

/* ─── RESPONSIVE ─── */
@media (max-width: 768px) {
  .log-page {
    flex-direction: column;
    gap: 16px;
  }

  .log-left,
  .log-right {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-card {
    position: static;
  }
}
</style>
