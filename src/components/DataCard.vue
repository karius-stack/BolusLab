<script setup>
import { ref } from 'vue';
import { entries, settings } from '../state';
import SectionCard from './SectionCard.vue';

const confirmClear = ref(false)
const importStatus = ref(null)
const fileInput = ref(null)

function clearData() {
    entries.splice(0, entries.length)
    confirmClear.value = false
}

function exportData() {
    const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        entries: [...entries],
        settings: { ...settings },
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `boluslab-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
}

function triggerImport() {
    importStatus.value = null
    fileInput.value.click()
}

function handleImport(event) {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const backup = JSON.parse(e.target.result)

            if (!backup.entries || !Array.isArray(backup.entries)) {
                importStatus.value = { type: 'error', message: 'Ugyldig fil — mangler entries-data.' }
                return
            }

            entries.splice(0, entries.length, ...backup.entries)

            if (backup.settings && typeof backup.settings === 'object') {
                Object.assign(settings, backup.settings)
            }

            importStatus.value = {
                type: 'success',
                message: `${backup.entries.length} tester importert${backup.exportedAt ? ' (backup fra ' + backup.exportedAt.slice(0, 10) + ')' : ''}.`,
            }
        } catch {
            importStatus.value = { type: 'error', message: 'Kunne ikke lese filen. Er det en gyldig BolusLab-backup?' }
        }
    }
    reader.readAsText(file)
    event.target.value = ''
}
</script>

<template>
    <SectionCard title="Data">
        <p class="data-info">
            Data lagres lokalt i nettleseren (localStorage) og forblir på denne enheten.
            Eksporter jevnlig for å ta backup.
        </p>

        <div class="data-actions">
            <button class="action-btn export-btn" @click="exportData">Eksporter data</button>
            <button class="action-btn import-btn" @click="triggerImport">Importer backup</button>
            <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleImport" />
        </div>

        <div v-if="importStatus" class="import-status" :class="importStatus.type">
            {{ importStatus.message }}
        </div>

        <div class="data-divider"></div>

        <button v-if="!confirmClear" class="delete-btn" @click="confirmClear = true">
            Slett alle testdata
        </button>
        <div v-else class="confirm-box">
            <span class="confirm-text">Er du sikker? Dette kan ikke angres.</span>
            <button class="confirm-yes" @click="clearData">Ja, slett alt</button>
            <button class="confirm-cancel" @click="confirmClear = false">Avbryt</button>
        </div>
    </SectionCard>
</template>

<style scoped>
.data-info {
    font-size: 13px;
    color: var(--color-text-muted);
    margin: 0;
}

.data-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.action-btn {
    padding: 9px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-ui);
    transition: all var(--transition-base);
}

.export-btn {
    background: transparent;
    border: 1px solid rgba(56, 189, 248, 0.4);
    color: #38bdf8;
}

.export-btn:hover {
    background: rgba(56, 189, 248, 0.08);
}

.import-btn {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
}

.import-btn:hover {
    border-color: var(--color-border-hover);
    color: var(--color-text-primary);
}

.import-status {
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid;
}

.import-status.success {
    color: #34d399;
    border-color: rgba(52, 211, 153, 0.3);
    background: rgba(52, 211, 153, 0.08);
}

.import-status.error {
    color: #f87171;
    border-color: rgba(248, 113, 113, 0.3);
    background: rgba(248, 113, 113, 0.08);
}

.data-divider {
    height: 1px;
    background: var(--color-border);
}

.delete-btn {
    align-self: flex-start;
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #f87171;
    padding: 9px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-ui);
    transition: all var(--transition-base);
}

.delete-btn:hover {
    background: rgba(239, 68, 68, 0.08);
}

.confirm-box {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 10px;
    padding: 14px 16px;
}

.confirm-text {
    font-size: 13px;
    color: #fca5a5;
}

.confirm-yes {
    background: #ef4444;
    border: none;
    color: white;
    padding: 7px 16px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-ui);
}

.confirm-cancel {
    background: transparent;
    border: 1px solid var(--color-border);
    color: #94a3b8;
    padding: 7px 14px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 13px;
    font-family: var(--font-ui);
}
</style>
