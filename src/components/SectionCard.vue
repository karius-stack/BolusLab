<script setup>
defineProps({
    title: String,
    subtitle: String
})
</script>

<template>
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">{{ title }}</h3>
            <div v-if="subtitle" class="card-subtitle">{{ subtitle }}</div>
        </div>
        <div class="card-content">
            <slot></slot>  <!-- Form innhold eller annet går her -->
        </div>    
    </div>
</template>

<style scoped>
.card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    margin-bottom: var(--space-xl);
}

.card-header {
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--color-bg-hover);
}

.card-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-text-primary);
    letter-spacing: 0.1em;
    margin: 0;
}

.card-subtitle {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-top: 4px;
}

.card-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}
</style>