<script setup>
defineProps({
    zone: Object
})
</script>

<template>
    <span class="zone-badge" :style="{ borderColor: zone.color, backgroundColor: zone.color + '18'}">
        <span class="zone-dot" :style="{ backgroundColor: zone.color }"></span>
        {{ zone.label }}
    </span>
</template>

<style scoped>
.zone-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 20px;
    border: 1px solid;
    color: inherit;
}

.zone-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
}
</style>