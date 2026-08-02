<template>
  <div class="main-content fade-in">
    <header class="mb-8">
      <h1>{{ $t('kamchi.title') }}</h1>
      <p class="subtitle">{{ $t('kamchi.subtitle') }}</p>
    </header>

    <div class="glass-card wizard-card">
      <!-- Step Progress Indicator -->
      <div class="steps-indicator">
        <div 
          v-for="stepNum in 6" 
          :key="stepNum" 
          class="step-dot-container"
          :class="{ 
            active: currentStep === stepNum, 
            completed: currentStep > stepNum,
            clickable: isStepNavigatable(stepNum)
          }"
          @click="isStepNavigatable(stepNum) && (currentStep = stepNum)"
        >
          <div class="step-dot">{{ stepNum }}</div>
          <span class="step-label">{{ $t(`kamchi.labels.step${stepNum}`) }}</span>
        </div>
        <div class="progress-line" :style="{ width: ((currentStep - 1) / 5) * 100 + '%' }"></div>
      </div>

      <!-- Step Contents -->
      <div class="step-content-box mt-8">
        
        <!-- Step 1: Select Area -->
        <div v-if="currentStep === 1" class="fade-in">
          <h3>{{ $t('kamchi.selectArea') }}</h3>
          <div class="areas-grid mt-4">
            <button
              v-for="area in LIFE_AREAS"
              :key="area"
              type="button"
              class="area-select-btn"
              :class="{ active: selectedArea === area }"
              @click="selectArea(area)"
            >
              <span class="area-dot" :style="{ backgroundColor: getAreaColor(area) }"></span>
              <span class="area-name">{{ $t(`assessment.areas.${area}`) }}</span>
              <span class="area-score">({{ store.ratings[area].current }} / 10)</span>
            </button>
          </div>
        </div>

        <!-- Step 2: Konu (K) -->
        <div v-else-if="currentStep === 2" class="fade-in">
          <div class="step-header">
            <span class="badge badge-primary">{{ $t('kamchi.steps.subject.title') }}</span>
            <h3 class="mt-2">{{ $t('kamchi.steps.subject.desc') }}</h3>
          </div>
          <div class="form-group mt-4">
            <textarea
              v-model="planData.subject"
              rows="4"
              class="form-textarea"
              :placeholder="$t('kamchi.steps.subject.placeholder')"
            ></textarea>
          </div>
        </div>

        <!-- Step 3: Amaç (A) -->
        <div v-else-if="currentStep === 3" class="fade-in">
          <div class="step-header">
            <span class="badge badge-primary">{{ $t('kamchi.steps.goal.title') }}</span>
            <h3 class="mt-2">{{ $t('kamchi.steps.goal.desc') }}</h3>
          </div>
          <div class="form-group mt-4">
            <textarea
              v-model="planData.goal"
              rows="4"
              class="form-textarea"
              :placeholder="$t('kamchi.steps.goal.placeholder')"
            ></textarea>
          </div>
        </div>

        <!-- Step 4: Mevcut Durum (M) -->
        <div v-else-if="currentStep === 4" class="fade-in">
          <div class="step-header">
            <span class="badge badge-primary">{{ $t('kamchi.steps.status.title') }}</span>
            <h3 class="mt-2">{{ $t('kamchi.steps.status.desc') }}</h3>
          </div>
          <div class="info-bubble mt-4">
            <p>Seçilen Alan: <strong>{{ $t(`assessment.areas.${selectedArea}`) }}</strong></p>
            <p>Denge Çarkı Seviyeniz: <strong>Mevcut: {{ store.ratings[selectedArea].current }}/10</strong>, <strong>Hedef: {{ store.ratings[selectedArea].target }}/10</strong></p>
          </div>
          <div class="form-group mt-4">
            <textarea
              v-model="planData.status"
              rows="4"
              class="form-textarea"
              :placeholder="$t('kamchi.steps.status.placeholder')"
            ></textarea>
          </div>
        </div>

        <!-- Step 5: Çare (Ç) -->
        <div v-else-if="currentStep === 5" class="fade-in">
          <div class="step-header">
            <span class="badge badge-primary">{{ $t('kamchi.steps.cure.title') }}</span>
            <h3 class="mt-2">{{ $t('kamchi.steps.cure.desc') }}</h3>
          </div>

          <div class="cure-form-grid mt-4">
            <div class="form-group">
              <label class="form-label">1. {{ $t('kamchi.steps.cure.what') }}</label>
              <input type="text" v-model="planData.cure.what" class="form-input" placeholder="Yapacağınız eylem..." />
            </div>

            <div class="form-group">
              <label class="form-label">2. {{ $t('kamchi.steps.cure.why') }}</label>
              <input type="text" v-model="planData.cure.why" class="form-input" placeholder="Sizi harekete geçiren neden..." />
            </div>

            <div class="form-group">
              <label class="form-label">3. {{ $t('kamchi.steps.cure.how') }}</label>
              <textarea v-model="planData.cure.how" rows="2" class="form-textarea" placeholder="Nasıl yapacaksınız (somut adımlar)..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">4. {{ $t('kamchi.steps.cure.where') }}</label>
              <input type="text" v-model="planData.cure.where" class="form-input" placeholder="Evde, ofiste, online..." />
            </div>

            <div class="form-group">
              <label class="form-label">5. {{ $t('kamchi.steps.cure.when') }}</label>
              <input type="text" v-model="planData.cure.when" class="form-input" placeholder="Hangi sıklıkla, ne kadar süre..." />
            </div>

            <div class="form-group">
              <label class="form-label">6. {{ $t('kamchi.steps.cure.who') }}</label>
              <input type="text" v-model="planData.cure.who" class="form-input" placeholder="Arkadaşlar, topluluklar, ChatGPT..." />
            </div>

            <div class="form-group full-width">
              <label class="form-label">7. {{ $t('kamchi.steps.cure.obstacle') }}</label>
              <textarea v-model="planData.cure.obstacle" rows="2" class="form-textarea" placeholder="Olası engel ve bunu aşma planınız..."></textarea>
            </div>
          </div>
        </div>

        <!-- Step 6: Ismarlama (I) -->
        <div v-else-if="currentStep === 6" class="fade-in">
          <div class="step-header">
            <span class="badge badge-primary">{{ $t('kamchi.steps.commitment.title') }}</span>
            <h3 class="mt-2">{{ $t('kamchi.steps.commitment.desc') }}</h3>
          </div>

          <div class="form-group mt-4">
            <textarea
              v-model="planData.commitment"
              rows="4"
              class="form-textarea"
              :placeholder="$t('kamchi.steps.commitment.placeholder')"
            ></textarea>
          </div>
        </div>

      </div>

      <!-- Navigation buttons -->
      <div class="wizard-actions mt-8">
        <button 
          v-if="currentStep > 1" 
          @click="prevStep" 
          class="btn btn-secondary"
        >
          ← {{ $t('kamchi.prev') }}
        </button>
        <div class="spacer" v-else></div>
        
        <button 
          v-if="currentStep < 6" 
          @click="nextStep" 
          :disabled="!canGoNext" 
          class="btn btn-primary"
        >
          {{ $t('kamchi.next') }} →
        </button>
        <button 
          v-else 
          @click="finishPlan" 
          :disabled="!canGoNext" 
          class="btn btn-accent"
        >
          {{ $t('kamchi.finish') }}
        </button>
      </div>

    </div>

    <!-- Success Modal with Export options -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="glass-card modal-content fade-in">
        <div class="success-header">
          <span class="success-icon">🎉</span>
          <h2>KAMÇI Planınız Hazır!</h2>
          <p class="subtitle mt-1">Eylem planınız başarıyla kaydedildi. Planınızı bilgisayarınıza indirebilir veya kopyalayabilirsiniz.</p>
        </div>

        <div class="markdown-preview mt-6">
          <pre><code>{{ markdownContent }}</code></pre>
        </div>

        <div class="modal-footer mt-6">
          <button @click="copyToClipboard" class="btn btn-secondary">
            📋 {{ $t('kamchi.copyBtn') }}
          </button>
          <button @click="downloadMarkdown" class="btn btn-accent">
            💾 {{ $t('kamchi.downloadMd') }}
          </button>
          <button @click="closeSuccessModal" class="btn btn-primary">
            Kapat ve Paneli Gör
          </button>
        </div>

        <div v-if="copied" class="copied-toast">
          {{ $t('kamchi.copiedMsg') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCoachingStore, LIFE_AREAS, AREA_COLORS } from '../stores/coaching'
import type { LifeArea } from '../stores/coaching'

const store = useCoachingStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const currentStep = ref(1)
const selectedArea = ref<LifeArea>('growth')
const showSuccessModal = ref(false)
const copied = ref(false)
const editPlanId = ref<string | null>(null)

onMounted(() => {
  const planId = route.query.edit as string
  if (planId) {
    const existing = store.plans.find(p => p.id === planId)
    if (existing) {
      editPlanId.value = planId
      selectedArea.value = existing.area
      planData.value = {
        subject: existing.subject,
        goal: existing.goal,
        status: existing.status,
        cure: { ...existing.cure },
        commitment: existing.commitment
      }
    }
  }
})

const planData = ref({
  subject: '',
  goal: '',
  status: '',
  cure: {
    what: '',
    why: '',
    how: '',
    where: '',
    when: '',
    who: '',
    obstacle: ''
  },
  commitment: ''
})



function getAreaColor(area: LifeArea) {
  return AREA_COLORS[area]
}

function selectArea(area: LifeArea) {
  selectedArea.value = area
  // Prefill status with ratings
  planData.value.status = `Yaşam Denge Çarkı değerlendirmemde bu alanın seviyesi mevcut ${store.ratings[area].current}/10 düzeyindedir. Hedefim ise bunu ${store.ratings[area].target}/10 seviyesine yükseltmektir.`
}

function isStepValid(step: number) {
  if (step === 1) return !!selectedArea.value
  if (step === 2) return planData.value.subject.trim().length > 10
  if (step === 3) return planData.value.goal.trim().length > 10
  if (step === 4) return planData.value.status.trim().length > 10
  if (step === 5) {
    const c = planData.value.cure
    return c.what.trim().length > 2 && c.why.trim().length > 2 && c.how.trim().length > 5
  }
  if (step === 6) return planData.value.commitment.trim().length > 10
  return false
}

const canGoNext = computed(() => {
  return isStepValid(currentStep.value)
})

function isStepNavigatable(stepNum: number) {
  if (editPlanId.value) return true
  if (stepNum <= currentStep.value) return true
  for (let s = 1; s < stepNum; s++) {
    if (!isStepValid(s)) return false
  }
  return true
}

function nextStep() {
  if (canGoNext.value && currentStep.value < 6) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function finishPlan() {
  if (!canGoNext.value) return
  
  // Save/Update to Pinia
  store.savePlan({
    id: editPlanId.value || undefined,
    area: selectedArea.value,
    subject: planData.value.subject,
    goal: planData.value.goal,
    status: planData.value.status,
    cure: { ...planData.value.cure },
    commitment: planData.value.commitment
  })

  showSuccessModal.value = true
}

const markdownContent = computed(() => {
  const d = planData.value
  const areaName = t(`assessment.areas.${selectedArea.value}`).toUpperCase()
  return `# ${t('kamchi.export.title')} - ${areaName}

## ${t('kamchi.export.subject')}
${d.subject}

## ${t('kamchi.export.goal')}
${d.goal}

## ${t('kamchi.export.status')}
- ${t('kamchi.export.score')}: ${store.ratings[selectedArea.value].current}/10 (${t('assessment.targetLabel')}: ${store.ratings[selectedArea.value].target}/10)
- ${t('kamchi.export.detail')}: ${d.status}

## ${t('kamchi.export.cure')}
- **${t('kamchi.export.what')}** ${d.cure.what}
- **${t('kamchi.export.why')}** ${d.cure.why}
- **${t('kamchi.export.how')}** ${d.cure.how}
- **${t('kamchi.export.where')}** ${d.cure.where}
- **${t('kamchi.export.when')}** ${d.cure.when}
- **${t('kamchi.export.who')}** ${d.cure.who}
- **${t('kamchi.export.obstacle')}** ${d.cure.obstacle}

## ${t('kamchi.export.commitment')}
> **${d.commitment}**

---
*${t('kamchi.export.footer', { date: new Date().toLocaleDateString('tr-TR') })}*`
})

function copyToClipboard() {
  navigator.clipboard.writeText(markdownContent.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function downloadMarkdown() {
  const blob = new Blob([markdownContent.value], { type: 'text/markdown;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `kamci-plan-${selectedArea.value}.md`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function closeSuccessModal() {
  showSuccessModal.value = false
  router.push('/dashboard')
}
</script>

<style scoped>
.subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
}

.wizard-card {
  max-width: 800px;
  margin: 0 auto;
  min-height: 520px;
  display: flex;
  flex-direction: column;
}

/* Steps Indicator */
.steps-indicator {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 2.5rem;
}
.progress-line {
  position: absolute;
  top: 15px;
  left: 0;
  height: 2px;
  background: var(--accent-primary);
  z-index: 1;
  transition: width 0.3s ease;
}
.steps-indicator::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 2px;
  background: hsla(var(--hue), 20%, 80%, 0.08);
  z-index: 0;
}

.step-dot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  width: 40px;
}
.step-dot-container.clickable {
  cursor: pointer;
}
.step-dot-container.clickable:hover .step-dot {
  background: var(--accent-secondary);
  border-color: var(--accent-secondary);
  color: white;
  box-shadow: 0 0 10px var(--accent-secondary);
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: hsl(var(--hue), 24%, 10%);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: all 0.3s;
}

.step-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  font-weight: 500;
  white-space: nowrap;
}

.step-dot-container.active .step-dot {
  border-color: var(--accent-primary);
  color: #fff;
  background: var(--accent-primary-glow);
  box-shadow: 0 0 10px var(--accent-primary-glow);
}
.step-dot-container.active .step-label {
  color: var(--text-main);
  font-weight: 600;
}

.step-dot-container.completed .step-dot {
  border-color: var(--accent-secondary);
  color: var(--text-inverse);
  background: var(--accent-secondary);
}

.step-content-box {
  flex: 1;
}

.areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.area-select-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: hsla(var(--hue), 20%, 80%, 0.02);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.2s;
}
.area-select-btn:hover {
  border-color: var(--accent-primary-glow);
  background: hsla(var(--hue), 20%, 80%, 0.05);
}
.area-select-btn.active {
  border-color: var(--accent-primary);
  background: var(--accent-primary-glow);
  box-shadow: 0 0 8px var(--accent-primary-glow);
}

.area-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.area-name {
  font-weight: 500;
  font-size: 0.95rem;
}

.area-score {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: auto;
}

.info-bubble {
  background: rgba(var(--accent-primary-glow), 0.05);
  border: 1px dashed var(--accent-primary);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cure-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 576px) {
  .cure-form-grid {
    grid-template-columns: 1fr;
  }
}
.full-width {
  grid-column: span 2;
}
@media (max-width: 576px) {
  .full-width {
    grid-column: span 1;
  }
}

.quick-suggests {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 0.75rem;
}
.suggest-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}
.suggest-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.suggest-items button {
  text-align: left;
  justify-content: flex-start;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
}

/* Success modal styling */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-content {
  max-width: 680px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  text-align: center;
}

.success-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.markdown-preview {
  background: #0d0e14;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: left;
  max-height: 250px;
  overflow-y: auto;
}

.markdown-preview code {
  font-size: 0.8rem;
  background: transparent;
  color: #a78bfa;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.copied-toast {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent-success);
  color: #fff;
  padding: 0.5rem 1.5rem;
  border-radius: 99px;
  font-weight: 500;
  font-size: 0.85rem;
  box-shadow: var(--shadow-md);
  animation: fadeInOut 2s ease forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 8px); }
  15% { opacity: 1; transform: translate(-50%, 0); }
  85% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -8px); }
}
</style>
