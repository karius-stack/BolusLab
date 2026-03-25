<script setup>
defineProps({
    label: String,
    active: Boolean,
    color: { type: String, default: '#38bdf8' }
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
        :style="active ? {
            backgroundColor: color + '18',
            color: color,
            borderColor: color
        } : {}"
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
</style>