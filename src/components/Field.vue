<script setup>
defineProps({
    label: String
})
</script>

<template>
    <div class="field">
        <label class="field-label">{{ label }}</label>
        <slot></slot> <!-- Innholdet fra parent går her -->
    </div>
</template>

<style scoped>
.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

.field-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-secondary);
    letter-spacing: 0.06em;
}
</style>