<template>
  <div class="main-content fade-in">
    <header class="mb-6 header-with-action">
      <div>
        <h1>{{ $t('assessment.title') }}</h1>
        <p class="subtitle mt-1">{{ $t('assessment.subtitle') }}</p>
      </div>
      <router-link to="/dashboard" class="btn btn-secondary btn-sm">
        ← {{ $t('nav.dashboard') }}
      </router-link>
    </header>

    <div class="assessment-layout">
      <!-- Sliders Grid Form -->
      <div class="sliders-panel glass-card">
        <div class="sliders-grid">
          <div v-for="area in LIFE_AREAS" :key="area" class="slider-card">
            <h4 :style="{ color: getAreaColor(area) }">
              {{ $t(`assessment.areas.${area}`) }}
            </h4>
            
            <div class="sliders-inputs mt-2">
              <!-- Current Rating -->
              <div class="slider-container">
                <div class="slider-header-compact">
                  <span class="label">{{ $t('assessment.currentShort') }}</span>
                  <span class="slider-value" :style="{ color: 'rgba(239, 68, 68, 1)' }">
                    {{ currentRatings[area].current }}
                  </span>
                </div>
                <input
                  v-model.number="currentRatings[area].current"
                  type="range"
                  min="1"
                  max="10"
                  class="custom-slider-compact"
                  :style="{ '--slider-color': 'rgba(239, 68, 68, 0.85)', '--slider-color-glow': 'rgba(239, 68, 68, 0.3)' }"
                />
              </div>

              <!-- Target Rating -->
              <div class="slider-container mt-1">
                <div class="slider-header-compact">
                  <span class="label">{{ $t('assessment.targetShort') }}</span>
                  <span class="slider-value" :style="{ color: 'rgba(6, 182, 212, 1)' }">
                    {{ currentRatings[area].target }}
                  </span>
                </div>
                <input
                  v-model.number="currentRatings[area].target"
                  type="range"
                  min="1"
                  max="10"
                  class="custom-slider-compact"
                  :style="{ '--slider-color': 'rgba(6, 182, 212, 0.85)', '--slider-color-glow': 'rgba(6, 182, 212, 0.3)' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Radar Preview -->
      <div class="glass-card preview-panel">
        <h3>{{ $t('dashboard.wheelSummary') }}</h3>
        <div class="chart-wrapper mt-3">
          <RadarChart :ratings="currentRatings" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCoachingStore, LIFE_AREAS, AREA_COLORS } from '../stores/coaching'
import type { LifeArea } from '../stores/coaching'
import RadarChart from '../components/RadarChart.vue'

const store = useCoachingStore()

// Clone local copy of ratings
const currentRatings = ref(
  JSON.parse(JSON.stringify(store.ratings))
)

function getAreaColor(area: LifeArea) {
  return AREA_COLORS[area]
}

// Deep watch ratings and save instantly to the Pinia store (which writes to localStorage)
watch(
  currentRatings,
  (newVal) => {
    store.saveRatings(newVal)
  },
  { deep: true }
)
</script>

<style scoped>
.subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
}

.header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assessment-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 1200px) {
  .assessment-layout {
    grid-template-columns: 1fr;
  }
}

.sliders-panel {
  display: flex;
  flex-direction: column;
}

.sliders-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
@media (max-width: 576px) {
  .sliders-grid {
    grid-template-columns: 1fr;
  }
}

.slider-card {
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s;
}
.slider-card:hover {
  border-color: var(--border-color-hover);
}
.slider-card h4 {
  font-size: 0.95rem;
  margin: 0;
}

.sliders-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.15rem;
}

.slider-value {
  font-weight: 700;
  font-size: 0.85rem;
}

/* Compact Sliders */
.custom-slider-compact {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 99px;
  background: hsla(var(--hue), 20%, 80%, 0.08);
  outline: none;
  transition: background 0.2s;
}

.custom-slider-compact::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--slider-color, var(--accent-primary));
  cursor: pointer;
  transition: transform 0.1s;
  box-shadow: 0 0 6px var(--slider-color-glow, var(--accent-primary-glow));
}
.custom-slider-compact::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.preview-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 90px;
  height: 520px;
}

.chart-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}
</style>
