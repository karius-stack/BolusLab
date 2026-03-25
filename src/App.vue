<script setup>
import { ref } from 'vue'
import HomeView from './views/HomeView.vue';
import LogView from './views/LogView.vue';
import AnalyzeView from './views/AnalyzeView.vue';
import SettingsView from './views/SettingsView.vue';
import BgLayer from './components/BgLayer.vue';

const currentView = ref('home')
</script>

<template>
  <BgLayer />
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
      <button @click="currentView = 'home'" class="nav-btn" :class="{ active: currentView === 'home' }">Hjem</button>
      <button @click="currentView = 'log'" class="nav-btn" :class="{ active: currentView === 'log' }">Logg</button>
      <button @click="currentView = 'analyze'" class="nav-btn" :class="{ active: currentView === 'analyze' }">Analyse</button>
      <button @click="currentView = 'settings'" class="nav-btn" :class="{ active: currentView === 'settings' }">Innstillinger</button>
    </nav>
  </header>
  <main class="main-content">
    <HomeView v-if="currentView === 'home'" />
    <LogView v-else-if="currentView === 'log'" />
    <AnalyzeView v-else-if="currentView === 'analyze'" />
    <SettingsView v-else-if="currentView === 'settings'" />
  </main>
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
  font-size: 11px;
  color: #64748b;
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
  padding: 7px 18px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-ui);
  transition: all var(--transition-base);
}

.nav-btn:hover {
  color: #94a3b8;
  transform: translateY(-1px);
}

.nav-btn.active {
  background: #334155;
  color: var(--color-text-primary);
  font-weight: 600;
}

.main-content {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 20px 0;
}
</style>