<template>
  <div class="main-content fade-in">
    <!-- Header -->
    <header class="dashboard-header mb-6">
      <h1>{{ $t('dashboard.title') }}</h1>
      <p class="subtitle">{{ $t('dashboard.subtitle') }}</p>
    </header>

    <!-- 3-Column Cockpit Grid -->
    <div class="dashboard-layout">
      
      <!-- Column 1: Core Values Card -->
      <div class="glass-card values-card">
        <div class="section-header">
          <h3>{{ $t('dashboard.valuesSummary') }}</h3>
          <router-link v-if="store.isValuesCompleted" to="/values" class="btn btn-secondary btn-icon-only" :title="$t('values.title')">
            <Pencil :size="14" />
          </router-link>
        </div>
        <div v-if="store.isValuesCompleted" class="values-list">
          <div 
            v-for="(val, index) in store.selectedValues" 
            :key="val" 
            class="value-item"
            :style="{ '--delay': index }"
          >
            <span class="value-rank">#{{ index + 1 }}</span>
            <span class="value-text">{{ $t(`values.list.${val}`) }}</span>
          </div>
        </div>
        <div v-else class="empty-state py-6">
          <span class="empty-icon">💎</span>
          <p>{{ $t('dashboard.valuesHint') }}</p>
          <router-link to="/values" class="btn btn-accent mt-4">
            {{ $t('dashboard.startValues') }}
          </router-link>
        </div>
      </div>

      <!-- Column 2: Radar Chart Card -->
      <div class="glass-card chart-card">
        <div class="section-header">
          <h3>{{ $t('dashboard.wheelSummary') }}</h3>
          <router-link v-if="store.isAssessmentCompleted" to="/assessment" class="btn btn-secondary btn-icon-only" :title="$t('assessment.title')">
            <Pencil :size="14" />
          </router-link>
        </div>
        <div v-if="store.isAssessmentCompleted" class="chart-wrapper mt-3">
          <RadarChart :ratings="store.ratings" />
        </div>
        <div v-else class="empty-state py-6">
          <span class="empty-icon">📊</span>
          <p>{{ $t('dashboard.wheelHint') }}</p>
          <router-link to="/assessment" class="btn btn-primary mt-4">
            {{ $t('dashboard.startAssessment') }}
          </router-link>
        </div>
      </div>

      <!-- Column 3: Active Commitments Card (WILL) -->
      <div class="glass-card commitments-card">
        <div class="section-header">
          <h3>{{ $t('dashboard.activeCommitments') }}</h3>
          <router-link to="/kamchi" class="btn btn-primary btn-icon-only" :title="$t('dashboard.newPlanBtn')">
            <Plus :size="16" />
          </router-link>
        </div>

        <div v-if="store.plans.length > 0" class="commitments-scroll-list mt-3">
          <div v-for="plan in store.plans" :key="plan.id" class="plan-card-item mb-3" @click="showPlanDetails(plan)">
            <div class="plan-card-header">
              <span 
                class="badge" 
                :style="{ backgroundColor: getAreaColor(plan.area) + '20', color: getAreaColor(plan.area), borderColor: getAreaColor(plan.area) }"
              >
                {{ $t(`assessment.areas.${plan.area}`) }}
              </span>
              <div class="header-right-actions">
                <span class="plan-date mr-2">{{ plan.createdAt }}</span>
                <button @click.stop="editPlan(plan.id)" class="btn-action-icon edit" :title="$t('dashboard.edit')">
                  <Pencil :size="14" />
                </button>
                <button @click.stop="confirmDeletePlan(plan.id)" class="btn-action-icon delete" :title="$t('dashboard.delete')">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
            
            <h4 class="mt-2">{{ plan.subject }}</h4>
            <p class="plan-summary mt-1">{{ plan.commitment }}</p>
          </div>
        </div>

        <div v-else class="empty-state py-12">
          <span class="empty-icon">📝</span>
          <p class="px-4">{{ $t('dashboard.noCommitments') }}</p>
          <router-link to="/kamchi" class="btn btn-primary mt-4">
            {{ $t('dashboard.newPlanBtn') }}
          </router-link>
        </div>
      </div>

    </div>

    <!-- Plan Detail Modal -->
    <div v-if="activePlan" class="modal-overlay" @click.self="activePlan = null">
      <div class="glass-card modal-content fade-in">
        <button class="close-btn" @click="activePlan = null">×</button>
        
        <div class="modal-header">
          <span 
            class="badge" 
            :style="{ backgroundColor: getAreaColor(activePlan.area) + '20', color: getAreaColor(activePlan.area), borderColor: getAreaColor(activePlan.area) }"
          >
            {{ $t(`assessment.areas.${activePlan.area}`) }}
          </span>
          <h2 class="mt-2">{{ activePlan.subject }}</h2>
        </div>

        <div class="modal-body mt-6">
          <div class="modal-grid">
            <div class="modal-col-left">
              <div class="detail-section">
                <h5>🎯 {{ $t('kamchi.steps.goal.title') }}</h5>
                <p class="mt-1">{{ activePlan.goal }}</p>
              </div>

              <div class="detail-section mt-5">
                <h5>📊 {{ $t('kamchi.steps.status.title') }}</h5>
                <p class="mt-1">{{ activePlan.status }}</p>
              </div>

              <div class="detail-section mt-5 commitment-callout">
                <h5>🤝 {{ $t('kamchi.steps.commitment.title') }}</h5>
                <p class="mt-1 font-italic">"{{ activePlan.commitment }}"</p>
              </div>
            </div>

            <div class="modal-col-right">
              <div class="detail-section">
                <h5>⚡ {{ $t('kamchi.steps.cure.title') }}</h5>
                <div class="cure-details mt-2">
                  <p><strong>Ne:</strong> {{ activePlan.cure.what }}</p>
                  <p><strong>Neden:</strong> {{ activePlan.cure.why }}</p>
                  <p><strong>Nasıl:</strong> {{ activePlan.cure.how }}</p>
                  <p><strong>Nerede:</strong> {{ activePlan.cure.where }}</p>
                  <p><strong>Ne zaman:</strong> {{ activePlan.cure.when }}</p>
                  <p><strong>Kiminle:</strong> {{ activePlan.cure.who }}</p>
                  <p v-if="activePlan.cure.obstacle"><strong>Engel/Çözüm:</strong> {{ activePlan.cure.obstacle }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Delete Confirmation Modal -->
    <div v-if="planToDelete" class="modal-overlay" @click.self="planToDelete = null">
      <div class="glass-card modal-content delete-confirm-modal fade-in">
        <button class="close-btn" @click="planToDelete = null">×</button>
        <div class="text-center py-4">
          <span class="warning-icon">⚠️</span>
          <h3 class="mt-4">{{ $t('dashboard.confirmDeleteTitle') }}</h3>
          <p class="subtitle mt-3">{{ $t('dashboard.confirmDelete') }}</p>
          
          <div class="modal-footer mt-8 justify-center">
            <button @click="planToDelete = null" class="btn btn-secondary mr-3">
              {{ $t('dashboard.cancel') }}
            </button>
            <button @click="executeDelete" class="btn btn-danger">
              {{ $t('dashboard.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useCoachingStore, AREA_COLORS } from '../stores/coaching'
import type { KamchiPlan, LifeArea } from '../stores/coaching'
import RadarChart from '../components/RadarChart.vue'

const store = useCoachingStore()
const router = useRouter()
const activePlan = ref<KamchiPlan | null>(null)
const planToDelete = ref<string | null>(null)

function getAreaColor(area: string) {
  return AREA_COLORS[area as LifeArea] || 'var(--accent-primary)'
}

function showPlanDetails(plan: KamchiPlan) {
  activePlan.value = plan
}

function editPlan(planId: string) {
  router.push(`/kamchi?edit=${planId}`)
}

function confirmDeletePlan(planId: string) {
  planToDelete.value = planId
}

function executeDelete() {
  if (planToDelete.value) {
    store.deletePlan(planToDelete.value)
    planToDelete.value = null
  }
}
</script>

<style scoped>
.subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
  margin-top: 0.25rem;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 0.9fr 1.25fr 1.15fr;
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 1200px) {
  .dashboard-layout {
    grid-template-columns: 1.2fr 1fr;
    gap: 1.5rem;
  }
}
@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}

.chart-card, .values-card, .commitments-card {
  display: flex;
  flex-direction: column;
  height: 520px; /* Uniform height for perfect symmetry on desktop */
}
@media (max-width: 1200px) {
  .chart-card, .values-card, .commitments-card {
    height: auto;
    min-height: 400px;
  }
}

.chart-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.values-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.value-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.85rem;
  background: hsla(var(--hue), 20%, 80%, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: calc(var(--delay) * 0.05s);
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

.value-rank {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--accent-secondary);
  font-size: 1rem;
}

.value-text {
  font-weight: 500;
}

/* Column 3: Commitments scrollable list */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}
.section-header h3 {
  margin: 0;
}

.commitments-scroll-list {
  overflow-y: auto;
  flex: 1;
  padding-right: 0.5rem;
}
/* Style scrollbar */
.commitments-scroll-list::-webkit-scrollbar {
  width: 6px;
}
.commitments-scroll-list::-webkit-scrollbar-track {
  background: transparent;
}
.commitments-scroll-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 99px;
}

.plan-card-item {
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
}
.plan-card-item:hover {
  border-color: var(--border-color-hover);
  background: rgba(255, 255, 255, 0.03);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.plan-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.plan-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-action-icon {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-action-icon:hover {
  background: rgba(255, 255, 255, 0.08);
}

.btn-action-icon.edit:hover {
  color: var(--accent-secondary);
}

.btn-action-icon.delete:hover {
  color: hsl(0, 85%, 60%);
}

.plan-summary {
  color: var(--text-muted);
  font-size: 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  color: var(--text-muted);
}
.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.4;
}

/* Modal details */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-content {
  max-width: 1100px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 2.5rem;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .modal-grid {
    grid-template-columns: 1.2fr 1fr;
    gap: 2rem;
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  background: transparent;
  border: none;
  font-size: 1.75rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
}
.close-btn:hover {
  color: var(--text-main);
}

.modal-body h5 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--accent-secondary);
}

.cure-details {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.commitment-callout {
  background: rgba(262, 82%, 60%, 0.05);
  border-left: 3px solid var(--accent-primary);
  padding: 0.75rem 1rem;
  border-radius: 0 0.75rem 0.75rem 0;
}

.delete-confirm-modal {
  max-width: 440px;
  text-align: center;
  padding: 2.5rem 2rem;
}

.warning-icon {
  font-size: 3rem;
  display: block;
  margin: 0 auto;
}

.btn-danger {
  background: hsl(0, 85%, 60%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.65rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: hsl(0, 85%, 50%);
  transform: translateY(-1px);
}
</style>
