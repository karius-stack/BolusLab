<script setup>
import { ref } from 'vue'
import { ZONES } from "./constants";

const currentView = ref('home')
</script>

<template>
  <p>Gjeldene view: {{ currentView }}</p>
  <header class="app-header">
    <!-- Logo + Title -->
    <div class="header-left">
      <div class="logo">BL</div>
      <div>
        <div class="app-title">BolusLab</div>
        <div class="app-subtitle">Testverktøy for insulinsystemer</div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="nav-tabs">
      <button @click="currentView = 'home'" class="nav-btn">Hjem</button>
      <button @click="currentView = 'log'"class="nav-btn">Logg</button>
      <button @click="currentView = 'analyze'"class="nav-btn">Analyse</button>
      <button @click="currentView = 'settings'"class="nav-btn">Innstillinger</button>
    </nav>
  </header>
  <main class="main-content">
    <div v-if="currentView == 'home'">Hjem view går her</div>
    <div v-else-if="currentView == 'log'">Logg view går her</div>
    <div v-else-if="currentView == 'analyze'">Analyse view går her</div>
    <div v-else>Innstillinger view går her</div>
  </main>
  <div>
    <h2>Soner:</h2>
    <div v-for="zone in ZONES" :key="zone.id" style="border: 1px solid white; padding: 10px; margin: 5px;">
      {{ zone.label }} - her er tiden: {{ zone.range }}
    </div>
  </div>
</template>

<style scoped>
/* Stil nav her */
.app-header {
  background: linear-gradient(180deg, #1e293b 0%, #162032 100%);
  border-bottom: 1px solid #293548;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--color-bg-primary);
  flex-shrink: 0;
  letter-spacing: 0.01em;
}

.app-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.app-subtitle {
  font-size: 10px;
  color: var(--color-border-hover);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
}

.nav-tabs {
  display: flex;
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  padding: 3px;
  border: 1px solid #293548;
  gap: 2px;
}

.nav-btn {
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;;
  font-family: var(--font-ui);
  transition: all var(--transition-base);
}

.nav-btn:hover {
  transform: translateY(-2px);
}

.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 20px 0;
}
</style>