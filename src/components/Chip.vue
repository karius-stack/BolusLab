<script setup>
defineProps({
    label: String,
    active: Boolean
})

const emit = defineEmits(['toggle'])

function handleClick() {
    emit('toggle')
}
</script>

<template>
    <button
        class="chip"
        :class="{ active }"
        @click="handleClick"
    >
        {{ label }}
    </button>
</template>

<style scoped>
.chip {
    padding: 5px 13px;
    border-radius: 20px;
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all var(--transition-fast);
}

.chip:hover {
    transform: translateY(-1px);
}

.chip.active {
    background: var(--color-accent) + '18';
    color: var(--color-accent);
    border-color: var(--color-accent);
}
</style>