<template>
  <div class="color-test-page">
    <div class="header-section">
      <h1 class="page-title">{{ $t('colorTest.title') }}</h1>
      <p class="page-subtitle">{{ $t('colorTest.subtitle') }}</p>
    </div>

    <!-- Active Test Wizard -->
    <div v-if="!isCompleted" class="test-wizard card">
      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-info">
          <span class="step-label">
            {{ $t('colorTest.questionCount', { current: currentStep + 1, total: totalQuestions }) }}
          </span>
          <span class="category-badge">
            {{ $t(`colorTest.${currentQuestion.categoryKey}`) }}
          </span>
        </div>
        <div class="progress-bar-bg">
          <div
            class="progress-bar-fill"
            :style="{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }"
          />
        </div>
      </div>

      <!-- Question Content -->
      <div class="question-container">
        <h2 class="question-title">
          {{ currentStep + 1 }}. {{ $t(`colorTest.${currentQuestion.titleKey}`) }}
        </h2>
        <p class="question-hint">{{ $t('colorTest.selectRankHint') }}</p>

        <!-- Options Ranking -->
        <div class="options-list">
          <div
            v-for="opt in currentQuestion.options"
            :key="opt.id"
            class="option-card"
            :class="{ selected: currentAnswer[opt.color] > 0 }"
          >
            <div class="option-header">
              <p class="option-text">{{ $t(`colorTest.${opt.textKey}`) }}</p>
            </div>

            <!-- Rating Selector (4, 3, 2, 1 points) -->
            <div class="rank-buttons">
              <button
                v-for="score in [4, 3, 2, 1]"
                :key="score"
                type="button"
                class="rank-btn"
                :class="{ active: currentAnswer[opt.color] === score }"
                @click="setOptionScore(opt.color, score)"
              >
                <span class="score-num">{{ score }}</span>
                <span class="score-label">
                  {{ score === 4 ? $t('colorTest.fitsMost') : score === 1 ? $t('colorTest.fitsLeast') : `${score} ${$t('colorTest.points')}` }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Warning -->
      <div v-if="validationError" class="validation-alert">
        ⚠️ {{ validationError }}
      </div>

      <!-- Navigation Footer -->
      <div class="wizard-actions">
        <button
          v-if="currentStep > 0"
          type="button"
          class="btn btn-secondary"
          @click="prevStep"
        >
          ← {{ $t('colorTest.prevQuestion') }}
        </button>
        <div class="spacer" />
        <button
          v-if="currentStep < totalQuestions - 1"
          type="button"
          class="btn btn-primary"
          @click="nextStep"
        >
          {{ $t('colorTest.nextQuestion') }} →
        </button>
        <button
          v-else
          type="button"
          class="btn btn-success"
          @click="finishTest"
        >
          ✓ {{ $t('colorTest.finishTest') }}
        </button>
      </div>
    </div>

    <!-- Results Report Screen -->
    <div v-else class="results-screen">
      <!-- Top Action Bar -->
      <div class="results-header-actions">
        <button type="button" class="btn btn-outline" @click="handleRetake">
          🔄 {{ $t('colorTest.retakeTest') }}
        </button>
      </div>

      <!-- Hero Cards: Dominant & Secondary Colors -->
      <div class="hero-grid">
        <div class="hero-card dominant" :class="dominantColor">
          <div class="card-badge">{{ $t('colorTest.results.dominantColor') }}</div>
          <h2 class="color-title">
            {{ $t(`colorTest.results.colors.${dominantColor}.name`) }}
          </h2>
          <div class="percentage-display">
            %{{ store.colorPercentages[dominantColor] }}
          </div>
          <p class="traits-text">
            {{ $t(`colorTest.results.colors.${dominantColor}.traits`) }}
          </p>
          <p class="desc-text">
            {{ $t(`colorTest.results.colors.${dominantColor}.description`) }}
          </p>
        </div>

        <div v-if="secondaryColor" class="hero-card secondary" :class="secondaryColor">
          <div class="card-badge">{{ $t('colorTest.results.secondaryColor') }}</div>
          <h3 class="color-title">
            {{ $t(`colorTest.results.colors.${secondaryColor}.name`) }}
          </h3>
          <div class="percentage-display">
            %{{ store.colorPercentages[secondaryColor] }}
          </div>
          <p class="traits-text">
            {{ $t(`colorTest.results.colors.${secondaryColor}.traits`) }}
          </p>
          <p class="desc-text">
            {{ $t(`colorTest.results.colors.${secondaryColor}.description`) }}
          </p>
        </div>
      </div>

      <!-- Percentage Distribution Breakdown -->
      <div class="breakdown-card card">
        <h3 class="section-title">{{ $t('colorTest.results.breakdownTitle') }}</h3>
        <p class="section-subtitle">{{ $t('colorTest.results.summaryTip') }}</p>

        <div class="percentage-bars">
          <div
            v-for="color in sortedColors"
            :key="color"
            class="bar-item"
          >
            <div class="bar-header">
              <span class="bar-color-name">
                {{ $t(`colorTest.results.colors.${color}.name`) }}
              </span>
              <span class="bar-percent">%{{ store.colorPercentages[color] }}</span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :class="color"
                :style="{ width: `${store.colorPercentages[color]}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Analysis Cards -->
      <div class="analysis-grid">
        <div
          v-for="color in sortedColors"
          :key="color"
          class="analysis-card card"
          :class="color"
        >
          <div class="analysis-header">
            <span class="color-dot" :class="color" />
            <h4 class="analysis-title">
              {{ $t(`colorTest.results.colors.${color}.name`) }} (%{{ store.colorPercentages[color] }})
            </h4>
          </div>
          <div class="analysis-body">
            <div class="info-block">
              <h5>💪 {{ $t('colorTest.strengths') }}</h5>
              <p>{{ $t(`colorTest.results.colors.${color}.strengths`) }}</p>
            </div>
            <div class="info-block">
              <h5>🌱 {{ $t('colorTest.improvements') }}</h5>
              <p>{{ $t(`colorTest.results.colors.${color}.improvements`) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCoachingStore } from '../stores/coaching'
import { COLOR_QUESTIONS } from '../data/colorQuestions'

type ColorType = 'red' | 'yellow' | 'green' | 'blue'

const store = useCoachingStore()
const currentStep = ref(0)
const validationError = ref('')

const totalQuestions = COLOR_QUESTIONS.length
const currentQuestion = computed(() => COLOR_QUESTIONS[currentStep.value])

// Local current question answers
const currentAnswer = ref<Record<ColorType, number>>({
  red: 0,
  yellow: 0,
  green: 0,
  blue: 0
})

// Load question answer from store if exists
function loadCurrentAnswer() {
  const existing = store.colorAnswers[currentQuestion.value.id]
  if (existing) {
    currentAnswer.value = { ...existing }
  } else {
    currentAnswer.value = {
      red: 0,
      yellow: 0,
      green: 0,
      blue: 0
    }
  }
}

onMounted(() => {
  loadCurrentAnswer()
})

const isCompleted = computed(() => store.isColorTestCompleted)

function setOptionScore(color: ColorType, score: number) {
  validationError.value = ''
  // Find which color currently has this score and swap
  const prevColorWithScore = (Object.keys(currentAnswer.value) as ColorType[]).find(
    (c) => currentAnswer.value[c] === score
  )
  const currentScoreOfColor = currentAnswer.value[color]

  if (prevColorWithScore && prevColorWithScore !== color) {
    currentAnswer.value[prevColorWithScore] = currentScoreOfColor
  }

  currentAnswer.value[color] = score
}

function validateCurrentStep(): boolean {
  const values = Object.values(currentAnswer.value)
  const uniqueValues = new Set(values)
  if (values.includes(0) || uniqueValues.size < 4) {
    validationError.value =
      store.locale === 'tr'
        ? 'Lütfen 4 seçeneğin her birine farklı bir puan (4, 3, 2, 1) verin.'
        : 'Please assign a unique rating (4, 3, 2, 1) to each of the 4 options.'
    return false
  }
  return true
}

function saveStep() {
  store.saveColorAnswer(currentQuestion.value.id, { ...currentAnswer.value })
}

function nextStep() {
  if (!validateCurrentStep()) return
  saveStep()
  if (currentStep.value < totalQuestions - 1) {
    currentStep.value++
    loadCurrentAnswer()
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    loadCurrentAnswer()
  }
}

function finishTest() {
  if (!validateCurrentStep()) return
  saveStep()
}

function handleRetake() {
  if (confirm(store.locale === 'tr' ? 'Testi sıfırlayıp yeniden başlamak istediğinizden emin misiniz?' : 'Are you sure you want to reset and retake the test?')) {
    store.resetColorTest()
    currentStep.value = 0
    loadCurrentAnswer()
  }
}

// Sorted colors by percentage descending
const sortedColors = computed<ColorType[]>(() => {
  const p = store.colorPercentages
  return (['red', 'yellow', 'green', 'blue'] as ColorType[]).sort((a, b) => p[b] - p[a])
})

const dominantColor = computed<ColorType>(() => sortedColors.value[0] || 'green')
const secondaryColor = computed<ColorType | null>(() => {
  return sortedColors.value[1] && store.colorPercentages[sortedColors.value[1]] > 0
    ? sortedColors.value[1]
    : null
})
</script>

<style scoped>
.color-test-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}
.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
}
.page-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  margin-top: 0.5rem;
}

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.75rem;
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-md);
}

/* Wizard */
.progress-container {
  margin-bottom: 1.75rem;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.step-label {
  font-weight: 600;
  color: var(--accent-primary);
}
.category-badge {
  background: hsla(var(--hue), 20%, 80%, 0.08);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
}
.progress-bar-bg {
  height: 8px;
  background: hsla(var(--hue), 20%, 80%, 0.1);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent-primary);
  transition: width 0.3s ease;
}

.question-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.5rem;
  line-height: 1.35;
}
.question-hint {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-card {
  border: 1px solid var(--border-color);
  background: hsla(var(--hue), 20%, 80%, 0.02);
  border-radius: 0.65rem;
  padding: 0.85rem 1.1rem;
  transition: all 0.2s ease;
}
.option-card:hover {
  border-color: var(--border-color-hover);
  background: hsla(var(--hue), 20%, 80%, 0.04);
}

.option-header {
  margin-bottom: 0.5rem;
}

.option-text {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-main);
}

.rank-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}

.rank-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 0.45rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}
.rank-btn:hover {
  border-color: var(--accent-primary);
  color: var(--text-main);
}
.rank-btn.active {
  background: var(--accent-primary-glow);
  border-color: var(--accent-primary);
  color: #fff;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px var(--accent-primary);
}
.score-num {
  font-size: 1.1rem;
  font-weight: 700;
}
.score-label {
  font-size: 0.75rem;
  opacity: 0.8;
}

.validation-alert {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.wizard-actions {
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.75rem;
}
.spacer { flex: 1; }

.btn {
  padding: 0.65rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.btn-primary {
  background: var(--accent-primary);
  color: #fff;
}
.btn-primary:hover {
  filter: brightness(1.1);
}
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}
.btn-secondary:hover {
  color: var(--text-main);
  border-color: var(--border-color-hover);
}
.btn-success {
  background: #22c55e;
  color: #fff;
}
.btn-success:hover {
  background: #16a34a;
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
}
.btn-outline:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Results Screen */
.results-screen {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}
.results-header-actions {
  display: flex;
  justify-content: flex-end;
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.hero-card {
  position: relative;
  padding: 1.75rem;
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  overflow: hidden;
  backdrop-filter: blur(12px);
}
.hero-card.red { border-left: 6px solid #ef4444; }
.hero-card.yellow { border-left: 6px solid #eab308; }
.hero-card.green { border-left: 6px solid #22c55e; }
.hero-card.blue { border-left: 6px solid #3b82f6; }

.card-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
.color-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}
.percentage-display {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--text-main), var(--text-muted));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-card.red .percentage-display { color: #ef4444; -webkit-text-fill-color: #ef4444; }
.hero-card.yellow .percentage-display { color: #eab308; -webkit-text-fill-color: #eab308; }
.hero-card.green .percentage-display { color: #22c55e; -webkit-text-fill-color: #22c55e; }
.hero-card.blue .percentage-display { color: #3b82f6; -webkit-text-fill-color: #3b82f6; }

.traits-text {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}
.desc-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Percentage Bars */
.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
}
.section-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.percentage-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.bar-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.4rem;
}
.bar-track {
  height: 12px;
  background: hsla(var(--hue), 20%, 80%, 0.08);
  border-radius: 6px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.bar-fill.red { background: linear-gradient(90deg, #dc2626, #ef4444); }
.bar-fill.yellow { background: linear-gradient(90deg, #ca8a04, #eab308); }
.bar-fill.green { background: linear-gradient(90deg, #16a34a, #22c55e); }
.bar-fill.blue { background: linear-gradient(90deg, #2563eb, #3b82f6); }

/* Analysis Grid */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 1.25rem;
}
.analysis-card {
  padding: 1.5rem;
}
.analysis-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;

}
.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}
.color-dot.red { background: #ef4444; }
.color-dot.yellow { background: #eab308; }
.color-dot.green { background: #22c55e; }
.color-dot.blue { background: #3b82f6; }

.analysis-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.analysis-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.info-block h5 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.25rem;
}
.info-block p {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.45;
}
</style>
