<template>
  <div class="main-content fade-in">
    <!-- Header -->
    <header class="dashboard-header mb-6 header-row">
      <div>
        <h1>{{ $t('dashboard.title') }}</h1>
        <p class="subtitle">{{ $t('dashboard.subtitle') }}</p>
      </div>

      <!-- Assigned Coach Card for Client -->
      <div 
        v-if="assignedCoach" 
        class="assigned-coach-card glass-card"
        @click="openFeedbackModal"
        :title="$t('dashboard.feedbackModalTitle')"
      >
        <div class="coach-card-left">
          <div class="coach-avatar" :style="{ backgroundColor: assignedCoach.avatarColor }">
            {{ assignedCoach.name.charAt(0) }}
          </div>
          <div class="coach-info">
            <span class="coach-tag">💼 {{ $t('dashboard.assignedCoachLabel') }}</span>
            <span class="coach-name">{{ assignedCoach.name }}</span>
            <span class="coach-email">{{ assignedCoach.email }}</span>
          </div>
        </div>

        <!-- Coach Evaluation & Rating Action Button / Badge -->
        <div class="coach-eval-actions">
          <div v-if="clientFeedback" class="coach-rating-badge" :title="$t('dashboard.coachRatingScore', { score: clientFeedback.rating })">
            <span class="star-icon">⭐</span>
            <span class="rating-num">{{ clientFeedback.rating.toFixed(1) }}</span>
          </div>

          <button 
            type="button"
            @click.stop="openFeedbackModal" 
            class="btn btn-rate-coach" 
          >
            <span class="btn-star-icon">⭐</span>
            <span class="btn-rate-text">{{ $t('dashboard.rateCoachBtn') }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 1. Kişilik Renkleri Özet Kartı (En Üstte) -->
    <div class="glass-card colors-summary-card mb-6">
      <div class="section-header">
        <h3>🎨 {{ $t('colorTest.title') }}</h3>
        <router-link v-if="store.isColorTestCompleted" to="/colors" class="btn btn-secondary btn-icon-only">
          <Pencil :size="14" />
        </router-link>
      </div>

      <div v-if="store.isColorTestCompleted" class="colors-dashboard-row mt-4">
        <div class="color-badge-summary">
          <span class="summary-label">{{ $t('colorTest.results.dominantColor') }}:</span>
          <span class="summary-value">
            {{ $t(`colorTest.results.colors.${dominantColor}.name`) }} (%{{ store.colorPercentages[dominantColor] }})
          </span>
        </div>
        <div class="mini-progress-bars">
          <div v-for="c in (['red', 'yellow', 'green', 'blue'] as const)" :key="c" class="mini-bar-item">
            <span class="mini-label">{{ $t(`colorTest.colorNames.${c}`) }}</span>
            <div class="mini-track">
              <div class="mini-fill" :class="c" :style="{ width: `${store.colorPercentages[c]}%` }" />
            </div>
            <span class="mini-pct">%{{ store.colorPercentages[c] }}</span>
          </div>
        </div>
        <router-link to="/colors" class="btn btn-secondary btn-sm">
          {{ $t('colorTest.viewReport') }} →
        </router-link>
      </div>
      <div v-else class="empty-state py-4">
        <span class="empty-icon">🎨</span>
        <p>{{ $t('colorTest.subtitle') }}</p>
        <router-link to="/colors" class="btn btn-primary mt-3">
          {{ $t('colorTest.startTest') }} →
        </router-link>
      </div>
    </div>

    <!-- 3-Column Cockpit Grid -->
    <div class="dashboard-layout">
      
      <!-- 2. Yaşam Denge Çarkı Özeti -->
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

      <!-- 3. Aktif Taahhütleriniz (ISMARLAMA) -->
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

      <!-- 4. Temel Değerleriniz -->
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

    <!-- Coach Evaluation & Rating Modal -->
    <div v-if="showFeedbackModal" class="modal-overlay" @click.self="closeFeedbackModal">
      <div class="glass-card modal-content eval-modal fade-in">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">⭐</span>
            <div>
              <h3>{{ $t('dashboard.feedbackModalTitle') }}</h3>
              <p class="modal-sub">{{ $t('dashboard.feedbackModalSubtitle') }}</p>
            </div>
          </div>
          <button class="close-btn" @click="closeFeedbackModal">×</button>
        </div>

        <form @submit.prevent="submitFeedback" class="eval-form">
          <!-- Main Star Rating Picker -->
          <div class="eval-section main-rating-card">
            <label class="eval-label">{{ $t('dashboard.overallRatingLabel') }}</label>
            <div class="star-rating-picker">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="star-btn"
                :class="{ 'active': star <= Math.round(hoverRating || feedbackForm.rating), 'hovered': star <= hoverRating }"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                @click="setMainRating(star)"
              >
                ★
              </button>
              <span class="rating-text-badge">
                {{ feedbackForm.rating }} / 5 {{ getRatingDescription(feedbackForm.rating) }}
              </span>
            </div>
          </div>

          <!-- Category Specific Ratings -->
          <div class="eval-section categories-box">
            <label class="eval-label mb-3">{{ $t('dashboard.categoryRatingsLabel') }}</label>
            
            <div class="category-row">
              <span class="cat-name">💬 {{ $t('dashboard.commCategoryLabel') }}</span>
              <div class="cat-pill-group">
                <button
                  v-for="num in 5"
                  :key="num"
                  type="button"
                  class="cat-num-btn"
                  :class="{ 'selected': feedbackForm.categories.communication === num }"
                  @click="setCategoryRating('communication', num)"
                >
                  {{ num }}
                </button>
              </div>
            </div>

            <div class="category-row">
              <span class="cat-name">🎯 {{ $t('dashboard.guidanceCategoryLabel') }}</span>
              <div class="cat-pill-group">
                <button
                  v-for="num in 5"
                  :key="num"
                  type="button"
                  class="cat-num-btn"
                  :class="{ 'selected': feedbackForm.categories.guidance === num }"
                  @click="setCategoryRating('guidance', num)"
                >
                  {{ num }}
                </button>
              </div>
            </div>

            <div class="category-row">
              <span class="cat-name">⚡ {{ $t('dashboard.motivationCategoryLabel') }}</span>
              <div class="cat-pill-group">
                <button
                  v-for="num in 5"
                  :key="num"
                  type="button"
                  class="cat-num-btn"
                  :class="{ 'selected': feedbackForm.categories.motivation === num }"
                  @click="setCategoryRating('motivation', num)"
                >
                  {{ num }}
                </button>
              </div>
            </div>
          </div>

          <!-- Title Input (Optional) -->
          <div class="eval-section">
            <label class="eval-label">{{ $t('dashboard.feedbackTitleLabel') }}</label>
            <input
              v-model="feedbackForm.title"
              type="text"
              class="form-control"
              :placeholder="$t('dashboard.feedbackTitlePlaceholder')"
            />
          </div>

          <!-- Notes & Feedback Textarea -->
          <div class="eval-section">
            <label class="eval-label">
              {{ $t('dashboard.feedbackCommentLabel') }} <span class="required-star">*</span>
            </label>
            <textarea
              v-model="feedbackForm.comment"
              rows="4"
              required
              class="form-control feedback-textarea"
              :placeholder="$t('dashboard.feedbackCommentPlaceholder')"
            ></textarea>
          </div>

          <!-- Success Alert / Notice -->
          <div v-if="feedbackSuccess" class="alert-success-banner fade-in">
            ✓ {{ $t('dashboard.feedbackSuccessMsg') }}
          </div>

          <!-- Modal Action Footer -->
          <div class="modal-footer mt-4">
            <button type="button" @click="closeFeedbackModal" class="btn btn-secondary">
              {{ $t('dashboard.cancel') }}
            </button>
            <button type="submit" class="btn btn-primary btn-save-feedback" :disabled="isSubmittingFeedback">
              <span v-if="isSubmittingFeedback">...</span>
              <span v-else>{{ $t('dashboard.saveFeedbackBtn') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useCoachingStore, AREA_COLORS } from '../stores/coaching'
import type { KamchiPlan, LifeArea } from '../stores/coaching'
import RadarChart from '../components/RadarChart.vue'

const store = useCoachingStore()
const router = useRouter()
const activePlan = ref<KamchiPlan | null>(null)
const planToDelete = ref<string | null>(null)

// Coach Evaluation & Rating Modal State
const showFeedbackModal = ref(false)
const hoverRating = ref(0)
const isSubmittingFeedback = ref(false)
const feedbackSuccess = ref(false)

const feedbackForm = reactive({
  id: '',
  rating: 5,
  categories: {
    communication: 5,
    guidance: 5,
    motivation: 5
  },
  title: '',
  comment: ''
})

const clientFeedback = computed(() => store.clientCoachFeedback)

function openFeedbackModal() {
  const existing = clientFeedback.value
  if (existing) {
    feedbackForm.id = existing.id
    feedbackForm.rating = existing.rating || 5
    feedbackForm.categories = {
      communication: existing.categories?.communication ?? 5,
      guidance: existing.categories?.guidance ?? 5,
      motivation: existing.categories?.motivation ?? 5
    }
    const catAvg = (feedbackForm.categories.communication + feedbackForm.categories.guidance + feedbackForm.categories.motivation) / 3
    feedbackForm.rating = existing.categories ? Number(catAvg.toFixed(1)) : (existing.rating || 5)
    feedbackForm.title = existing.title || ''
    feedbackForm.comment = existing.comment || ''
  } else {
    feedbackForm.id = ''
    feedbackForm.rating = 5
    feedbackForm.categories = {
      communication: 5,
      guidance: 5,
      motivation: 5
    }
    feedbackForm.title = ''
    feedbackForm.comment = ''
  }
  feedbackSuccess.value = false
  showFeedbackModal.value = true
}

function closeFeedbackModal() {
  showFeedbackModal.value = false
  feedbackSuccess.value = false
}

function setCategoryRating(category: 'communication' | 'guidance' | 'motivation', value: number) {
  feedbackForm.categories[category] = value
  const avg = (feedbackForm.categories.communication + feedbackForm.categories.guidance + feedbackForm.categories.motivation) / 3
  feedbackForm.rating = Number(avg.toFixed(1))
}

function setMainRating(star: number) {
  feedbackForm.rating = star
  feedbackForm.categories.communication = star
  feedbackForm.categories.guidance = star
  feedbackForm.categories.motivation = star
}

function getRatingDescription(rating: number) {
  if (rating >= 4.5) return '⭐ (Mükemmel)'
  if (rating >= 3.5) return '⭐ (Çok İyi)'
  if (rating >= 2.5) return '⭐ (İyi)'
  if (rating >= 1.5) return '⭐ (Orta)'
  return '⭐ (Geliştirilmeli)'
}

async function submitFeedback() {
  if (!feedbackForm.comment.trim()) return
  isSubmittingFeedback.value = true
  try {
    await store.saveCoachFeedback({
      id: feedbackForm.id || undefined,
      rating: feedbackForm.rating,
      categories: { ...feedbackForm.categories },
      title: feedbackForm.title.trim(),
      comment: feedbackForm.comment.trim()
    })
    feedbackSuccess.value = true
    setTimeout(() => {
      closeFeedbackModal()
    }, 1200)
  } catch (err) {
    console.error('Failed to submit coach feedback:', err)
  } finally {
    isSubmittingFeedback.value = false
  }
}

type ColorType = 'red' | 'yellow' | 'green' | 'blue'

const dominantColor = computed<ColorType>(() => {
  const p = store.colorPercentages
  const colors: ColorType[] = ['red', 'yellow', 'green', 'blue']
  const sorted = colors.sort((a, b) => p[b] - p[a])
  return sorted[0] || 'green'
})

const assignedCoach = computed(() => {
  const currentClient = store.currentUser
  if (!currentClient || !currentClient.coachId) return null
  return store.users.find(u => u._id === currentClient.coachId) || null
})

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
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.assigned-coach-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 0.75rem 1.35rem;
  background: rgba(236, 72, 153, 0.1);
  border: 1px solid rgba(236, 72, 153, 0.35);
  border-radius: 1.1rem;
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.12);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.assigned-coach-card:hover {
  background: rgba(236, 72, 153, 0.16);
  border-color: rgba(236, 72, 153, 0.55);
  box-shadow: 0 8px 25px rgba(236, 72, 153, 0.2);
  transform: translateY(-2px);
}

.coach-card-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.coach-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.15rem;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.coach-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.coach-tag {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #f472b6;
}

.coach-name {
  font-weight: 700;
  font-size: 0.98rem;
  color: var(--text-main);
}

.coach-email {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
  margin-top: 0.25rem;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 1200px) {
  .dashboard-layout {
    grid-template-columns: repeat(2, 1fr);
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

.colors-summary-card {
  margin-top: 1.5rem;
}
.colors-dashboard-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.color-badge-summary {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.summary-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.summary-value {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-main);
}
.mini-progress-bars {
  display: flex;
  flex: 1;
  gap: 1rem;
  min-width: 280px;
}
.mini-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.mini-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
}
.mini-track {
  height: 8px;
  background: hsla(var(--hue), 20%, 80%, 0.1);
  border-radius: 4px;
  overflow: hidden;
}
.mini-fill {
  height: 100%;
  border-radius: 4px;
}
.mini-fill.red { background: #ef4444; }
.mini-fill.yellow { background: #eab308; }
.mini-fill.green { background: #22c55e; }
.mini-fill.blue { background: #3b82f6; }

.mini-pct {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-main);
}
.btn-sm {
  padding: 0.4rem 0.85rem;
  font-size: 0.85rem;
}

/* Coach Evaluation & Rating Styles */
.coach-eval-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.coach-rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 0.35rem 0.8rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f59e0b;
}

.coach-rating-badge.unrated {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}

.coach-rating-badge.unrated .star-icon {
  opacity: 0.6;
}

.btn-icon-edit-coach {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-icon-edit-coach:hover {
  background: rgba(236, 72, 153, 0.25);
  border-color: rgba(236, 72, 153, 0.6);
  color: #f472b6;
  transform: translateY(-1px) scale(1.08);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.35);
}

.btn-rate-coach {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: linear-gradient(135deg, #f59e0b, #ec4899);
  color: white;
  border: none;
  border-radius: 2rem;
  padding: 0.45rem 1.1rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);
  transition: all 0.25s ease;
  white-space: nowrap;
}

.btn-rate-coach:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
}

.btn-star-icon {
  font-size: 0.95rem;
}

.eval-modal {
  max-width: 600px;
  width: 92%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.75rem;
  background: rgba(18, 24, 38, 0.95);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1.5rem;
  box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.75), 0 0 35px rgba(168, 85, 247, 0.15);
}

.eval-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  font-size: 1.8rem;
}

.modal-sub {
  font-size: 0.85rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.15rem;
}

.eval-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.eval-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.required-star {
  color: #f43f5e;
  font-weight: 700;
}

/* Glassmorphic Form Inputs & Textarea */
.form-control {
  width: 100%;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.85rem;
  padding: 0.85rem 1.15rem;
  font-family: var(--font-sans, inherit);
  color: #f8fafc;
  font-size: 0.95rem;
  line-height: 1.5;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.form-control::placeholder {
  color: rgba(148, 163, 184, 0.55);
  font-size: 0.9rem;
}

.form-control:focus {
  outline: none;
  background: rgba(15, 23, 42, 0.95);
  border-color: #a855f7;
  box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.25), inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.feedback-textarea {
  min-height: 110px;
  resize: vertical;
  line-height: 1.6;
}

.main-rating-card {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  padding: 1.1rem 1.35rem;
  border-radius: 1.1rem;
}

.star-rating-picker {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.35rem;
}

.star-btn {
  background: transparent;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0 0.1rem;
}

.star-btn.active,
.star-btn.hovered {
  color: #f59e0b;
  transform: scale(1.15);
  text-shadow: 0 0 16px rgba(245, 158, 11, 0.6);
}

.rating-text-badge {
  margin-left: 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #f59e0b;
}

.categories-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  gap: 0.85rem;
}

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.cat-name {
  font-size: 0.86rem;
  font-weight: 500;
  color: var(--text-muted, #cbd5e1);
}

.cat-pill-group {
  display: flex;
  gap: 0.35rem;
}

.cat-num-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--text-muted, #94a3b8);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.cat-num-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.cat-num-btn.selected {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: #818cf8;
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.alert-success-banner {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
}

.btn-save-feedback {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  border: none;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
  font-weight: 600;
  color: white;
  padding: 0.65rem 1.4rem;
  border-radius: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-feedback:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(236, 72, 153, 0.55);
}
</style>

