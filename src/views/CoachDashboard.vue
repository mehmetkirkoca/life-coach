<template>
  <div class="main-content fade-in">
    <!-- Header -->
    <header class="dashboard-header mb-6">
      <div class="header-title-row">
        <div>
          <div class="title-with-badge">
            <h1>💼 {{ $t('coach.title') }}</h1>
            <div v-if="store.coachAverageRating.count > 0" class="coach-overall-rating-badge" :title="$t('coach.coachAverageScore')">
              <span class="star-icon">⭐</span>
              <span class="avg-score">{{ store.coachAverageRating.average.toFixed(1) }}</span>
              <span class="review-count">({{ store.coachAverageRating.count }} Değerlendirme)</span>
            </div>
          </div>
          <p class="subtitle">{{ $t('coach.subtitle') }}</p>
        </div>
        
        <!-- Active Client Quick Switcher Badges -->
        <div class="clients-badge-row">
          <div 
            v-for="c in clients" 
            :key="c._id" 
            class="client-card-badge"
            :class="{ active: store.activeClientId === c._id }"
            @click="store.setActiveClient(c._id)"
          >
            <div class="client-avatar" :style="{ backgroundColor: c.avatarColor }">
              {{ c.name.charAt(0) }}
            </div>
            <div class="client-info">
              <span class="client-name">{{ c.name }}</span>
              <span class="client-role">{{ $t('coach.client') }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Grid: Left Column = Client Profile & Cockpit, Right Column = Session Notes -->
    <div class="coach-grid">
      <!-- LEFT COLUMN: Selected Client Cockpit Overview -->
      <div class="cockpit-column">
        <!-- Client Profile Header Card -->
        <div class="glass-card client-profile-card mb-6" v-if="activeClient">
          <div class="profile-header">
            <div class="big-avatar" :style="{ backgroundColor: activeClient.avatarColor }">
              {{ activeClient.name.charAt(0) }}
            </div>
            <div>
              <h3>{{ activeClient.name }}</h3>
              <p class="text-muted">{{ activeClient.email }}</p>
            </div>
          </div>
        </div>

        <!-- 1. Kişilik Renkleri Özet Kartı -->
        <div class="glass-card mb-6">
          <div class="section-header mb-3">
            <h4>🎨 {{ $t('colorTest.title') }}</h4>
          </div>
          <div v-if="store.isColorTestCompleted" class="colors-mini-summary">
            <div class="dominant-badge mb-3">
              <span class="text-muted">{{ $t('colorTest.results.dominantColor') }}:</span>
              <strong>{{ $t(`colorTest.results.colors.${dominantColor}.name`) }} (%{{ store.colorPercentages[dominantColor] }})</strong>
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
          </div>
          <div v-else class="text-muted text-center py-4">
            {{ $t('coach.notCompletedTest') }}
          </div>
        </div>

        <!-- 2. Yaşam Denge Çarkı Grafiği -->
        <div class="glass-card mb-6">
          <div class="section-header mb-3">
            <h4>📊 {{ $t('dashboard.wheelSummary') }}</h4>
          </div>
          <div v-if="store.isAssessmentCompleted" class="chart-container">
            <RadarChart :ratings="store.ratings" />
          </div>
          <div v-else class="text-muted text-center py-4">
            {{ $t('coach.notCompletedAssessment') }}
          </div>
        </div>

        <!-- 3. Core Values & Commitments -->
        <div class="glass-card mb-6">
          <div class="section-header mb-3">
            <h4>💎 {{ $t('dashboard.valuesSummary') }}</h4>
          </div>
          <div v-if="store.isValuesCompleted" class="values-flex">
            <span v-for="(v, i) in store.selectedValues" :key="v" class="value-chip">
              #{{ i + 1 }} {{ $t(`values.list.${v}`) }}
            </span>
          </div>
          <div v-else class="text-muted text-center py-2">
            {{ $t('coach.notCompletedValues') }}
          </div>
        </div>

        <!-- 4. Danışan Değerlendirmesi, Puanı ve Notları -->
        <div class="glass-card client-feedback-card mb-6">
          <div class="section-header mb-3">
            <h4>{{ $t('coach.clientFeedbackTitle') }}</h4>
            <div v-if="activeClientFeedback" class="feedback-star-badge">
              <span class="star-icon">⭐</span>
              <span class="score-text">{{ activeClientFeedback.rating.toFixed(1) }} / 5</span>
            </div>
          </div>

          <div v-if="activeClientFeedback" class="feedback-content-box">
            <!-- Title & Date -->
            <div v-if="activeClientFeedback.title" class="feedback-title-row">
              <h5 class="feedback-headline">"{{ activeClientFeedback.title }}"</h5>
              <span class="feedback-date">📅 {{ activeClientFeedback.date }}</span>
            </div>

            <!-- Categories Breakdown -->
            <div class="feedback-metrics-grid mt-3">
              <div class="metric-pill">
                <span class="metric-label">💬 {{ $t('coach.communication') }}</span>
                <span class="metric-val">{{ activeClientFeedback.categories?.communication || 5 }}/5</span>
              </div>
              <div class="metric-pill">
                <span class="metric-label">🎯 {{ $t('coach.guidance') }}</span>
                <span class="metric-val">{{ activeClientFeedback.categories?.guidance || 5 }}/5</span>
              </div>
              <div class="metric-pill">
                <span class="metric-label">⚡ {{ $t('coach.motivation') }}</span>
                <span class="metric-val">{{ activeClientFeedback.categories?.motivation || 5 }}/5</span>
              </div>
            </div>

            <!-- Client Note / Comment -->
            <div class="feedback-quote-box mt-3">
              <p class="feedback-text">{{ activeClientFeedback.comment }}</p>
            </div>
          </div>

          <div v-else class="empty-state text-muted text-center py-4">
            <span class="empty-icon-sm">⭐</span>
            <p class="mt-1">{{ $t('coach.noClientFeedbackYet') }}</p>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Görüşme Notları (Session Notes) -->
      <div class="notes-column">
        <div class="glass-card notes-card">
          <div class="notes-card-header">
            <div class="notes-title-group">
              <span class="header-emoji">📝</span>
              <h3>{{ $t('coach.notesTitle') }}</h3>
            </div>
            <button @click="openNewNoteModal" class="btn btn-primary btn-sm btn-icon flex items-center gap-1.5">
              <Plus :size="16" />
              <span>{{ $t('coach.addNoteBtn') }}</span>
            </button>
          </div>

          <!-- Session Notes List -->
          <div v-if="store.sessionNotes.length > 0" class="notes-scroll-list mt-4">
            <div 
              v-for="note in store.sessionNotes" 
              :key="note.id" 
              class="note-card-item mb-4"
            >
              <div class="note-card-header">
                <div>
                  <h4 class="note-title">{{ note.title }}</h4>
                  <span class="note-date">📅 {{ note.date }}</span>
                </div>
                <div class="note-actions">
                  <button @click="editNote(note)" class="btn-action-icon edit" title="Düzenle">
                    <Pencil :size="14" />
                  </button>
                  <button @click="confirmDeleteNote(note.id)" class="btn-action-icon delete" title="Sil">
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>

              <p class="note-content mt-2">{{ note.content }}</p>

              <!-- Action Items -->
              <div v-if="note.actionItems && note.actionItems.length > 0" class="action-items-box mt-3">
                <span class="box-title">🎯 {{ $t('coach.actionItems') }}:</span>
                <ul>
                  <li v-for="(item, idx) in note.actionItems" :key="idx">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <!-- Tags -->
              <div v-if="note.tags && note.tags.length > 0" class="tags-row mt-3">
                <span v-for="tag in note.tags" :key="tag" class="tag-badge">
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon-badge">📝</div>
            <p>{{ $t('coach.noNotes') }}</p>
            <button @click="openNewNoteModal" class="btn btn-primary btn-sm flex items-center gap-1.5 mt-2">
              <Plus :size="16" />
              <span>{{ $t('coach.addNoteBtn') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Note Add / Edit Modal -->
    <div v-if="showNoteModal" class="modal-overlay" @click.self="showNoteModal = false">
      <div class="glass-card modal-content fade-in">
        <button class="close-btn" @click="showNoteModal = false">×</button>
        <div class="modal-header-row mb-3">
          <h2>{{ editingNoteId ? $t('coach.editNoteTitle') : $t('coach.addNoteTitle') }}</h2>
        </div>

        <form @submit.prevent="saveNoteForm" class="form-grid">
          <div class="form-group">
            <label class="form-label">{{ $t('coach.noteTitleLabel') }}</label>
            <input v-model="noteForm.title" required type="text" class="input-field" placeholder="Örn: 2. Seans Görüşme Notları" />
          </div>

          <div class="form-group">
            <label class="form-label">{{ $t('coach.noteDateLabel') }}</label>
            <input v-model="noteForm.date" required type="date" class="input-field" />
          </div>

          <div class="form-group">
            <label class="form-label">{{ $t('coach.actionItemsLabel') }}</label>
            <input v-model="noteForm.actionItemsInput" type="text" class="input-field" placeholder="Örn: Haftalık çalışma planı, Denge Çarkı" />
          </div>

          <div class="form-group">
            <label class="form-label">{{ $t('coach.tagsLabel') }}</label>
            <input v-model="noteForm.tagsInput" type="text" class="input-field" placeholder="Örn: Kariyer, Zaman Yönetimi, Motivasyon" />
          </div>

          <div class="form-group full-width">
            <label class="form-label">{{ $t('coach.noteContentLabel') }}</label>
            <textarea v-model="noteForm.content" required rows="3" class="input-field" placeholder="Görüşmede konuşulan konular ve koçluk gözlemleri..."></textarea>
          </div>

          <div class="modal-footer full-width">
            <button type="button" @click="showNoteModal = false" class="btn btn-secondary modal-btn">
              {{ $t('dashboard.cancel') }}
            </button>
            <button type="submit" class="btn btn-primary modal-btn">
              {{ $t('coach.saveNoteBtn') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Custom Modal -->
    <div v-if="showDeleteConfirmModal" class="modal-overlay" @click.self="showDeleteConfirmModal = false">
      <div class="glass-card modal-content confirm-modal fade-in">
        <button class="close-btn" @click="showDeleteConfirmModal = false">×</button>
        <div class="confirm-modal-body">
          <div class="delete-warning-icon">
            <Trash2 :size="32" />
          </div>
          <h3>Görüşme Notunu Sil</h3>
          <p>Bu görüşme notunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
          <div class="confirm-actions">
            <button @click="showDeleteConfirmModal = false" class="btn btn-secondary modal-btn">
              {{ $t('dashboard.cancel') }}
            </button>
            <button @click="executeDeleteNote" class="btn btn-danger modal-btn">
              Evet, Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useCoachingStore } from '../stores/coaching'
import type { SessionNote } from '../stores/coaching'
import RadarChart from '../components/RadarChart.vue'

const store = useCoachingStore()

const showNoteModal = ref(false)
const editingNoteId = ref<string | null>(null)
const showDeleteConfirmModal = ref(false)
const noteToDeleteId = ref<string | null>(null)

function getTodayIsoDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return getTodayIsoDate()
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }
  }
  return dateStr
}

function formatDateForDisplay(isoDateStr: string): string {
  if (!isoDateStr) return ''
  if (isoDateStr.includes('-')) {
    const parts = isoDateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`
    }
  }
  return isoDateStr
}

const noteForm = ref({
  title: '',
  date: getTodayIsoDate(),
  content: '',
  actionItemsInput: '',
  tagsInput: ''
})

const clients = computed(() => {
  return store.assignedClients
})

const activeClient = computed(() => {
  return clients.value.find(u => u._id === store.activeClientId) || clients.value[0]
})

type ColorType = 'red' | 'yellow' | 'green' | 'blue'

const dominantColor = computed<ColorType>(() => {
  const p = store.colorPercentages
  const colors: ColorType[] = ['red', 'yellow', 'green', 'blue']
  const sorted = colors.sort((a, b) => p[b] - p[a])
  return sorted[0] || 'green'
})

const activeClientFeedback = computed(() => {
  const cId = store.activeClientId
  const coachId = store.currentUser?.roles.includes('coach') ? store.currentUser._id : 'coach_1'
  return store.coachFeedbacks.find(f => f.clientId === cId && f.coachId === coachId) || null
})

function openNewNoteModal() {
  editingNoteId.value = null
  noteForm.value = {
    title: '',
    date: getTodayIsoDate(),
    content: '',
    actionItemsInput: '',
    tagsInput: ''
  }
  showNoteModal.value = true
}

function editNote(note: SessionNote) {
  editingNoteId.value = note.id
  noteForm.value = {
    title: note.title,
    date: formatDateForInput(note.date),
    content: note.content,
    actionItemsInput: note.actionItems ? note.actionItems.join(', ') : '',
    tagsInput: note.tags ? note.tags.join(', ') : ''
  }
  showNoteModal.value = true
}

async function saveNoteForm() {
  const actionItems = noteForm.value.actionItemsInput
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const tags = noteForm.value.tagsInput
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  await store.saveSessionNote({
    id: editingNoteId.value || undefined,
    title: noteForm.value.title,
    date: formatDateForDisplay(noteForm.value.date),
    content: noteForm.value.content,
    actionItems,
    tags
  })

  showNoteModal.value = false
}

function confirmDeleteNote(noteId: string) {
  noteToDeleteId.value = noteId
  showDeleteConfirmModal.value = true
}

async function executeDeleteNote() {
  if (noteToDeleteId.value) {
    await store.deleteSessionNote(noteToDeleteId.value)
    noteToDeleteId.value = null
    showDeleteConfirmModal.value = false
  }
}
</script>

<style scoped>
.header-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.coach-overall-rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 0.3rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: #f59e0b;
}

.avg-score {
  color: #f59e0b;
}

.review-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted, #94a3b8);
}

/* Client Feedback Card Styles */
.client-feedback-card {
  border-color: rgba(245, 158, 11, 0.2);
}

.feedback-star-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 0.25rem 0.65rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f59e0b;
}

.feedback-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.feedback-headline {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main, #f8fafc);
  font-style: italic;
}

.feedback-date {
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
}

.feedback-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.5rem;
}

.metric-pill {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.45rem 0.65rem;
  border-radius: 0.6rem;
  gap: 0.15rem;
}

.metric-label {
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
}

.metric-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: #f59e0b;
}

.feedback-quote-box {
  background: rgba(255, 255, 255, 0.025);
  border-left: 3px solid #f59e0b;
  padding: 0.65rem 0.9rem;
  border-radius: 0 0.6rem 0.6rem 0;
}

.feedback-text {
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-main, #e2e8f0);
}

.clients-badge-row {
  display: flex;
  gap: 0.75rem;
}

.client-card-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.85rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.client-card-badge:hover {
  border-color: var(--border-color-hover);
  background: rgba(255, 255, 255, 0.06);
}

.client-card-badge.active {
  border-color: var(--accent-primary);
  background: var(--accent-primary-glow);
}

.client-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.client-info {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.client-role {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.coach-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .coach-grid {
    grid-template-columns: 1fr;
  }
}

.client-profile-card {
  padding: 1.25rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.big-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.4rem;
}

.colors-mini-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mini-progress-bars {
  display: flex;
  gap: 0.75rem;
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
  height: 6px;
  background: hsla(var(--hue), 20%, 80%, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.mini-fill {
  height: 100%;
}
.mini-fill.red { background: #ef4444; }
.mini-fill.yellow { background: #eab308; }
.mini-fill.green { background: #22c55e; }
.mini-fill.blue { background: #3b82f6; }

.mini-pct {
  font-size: 0.75rem;
  font-weight: 600;
}

.chart-container {
  max-width: 320px;
  margin: 0 auto;
}

.values-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.value-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Notes Column */
.notes-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notes-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.notes-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notes-title-group h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.header-emoji {
  font-size: 1.3rem;
}

.note-card-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.note-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.note-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.note-content {
  color: var(--text-main);
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.action-items-box {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.85rem;
}

.box-title {
  font-weight: 600;
  color: var(--accent-secondary);
  display: block;
  margin-bottom: 0.35rem;
}

.action-items-box ul {
  margin: 0;
  padding-left: 1.2rem;
}

.tags-row {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag-badge {
  font-size: 0.75rem;
  color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1.5rem;
  text-align: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0.85rem;
  border: 1px dashed var(--border-color);
  margin-top: 1rem;
}

.empty-icon-badge {
  font-size: 2.2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  margin-bottom: 0.25rem;
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.9rem;
  max-width: 320px;
  margin: 0;
}

/* Modal Popup Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  max-width: 780px;
  width: 100%;
  position: relative;
  padding: 1.75rem 2rem;
  border-radius: 1.25rem;
  background: #181824;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #ffffff;
}

.modal-header-row h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
  display: block;
}

.input-field {
  width: 100%;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.55rem 0.85rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: var(--accent-primary);
}

.note-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-action-icon {
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-icon.edit:hover {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

.btn-action-icon.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.input-field[type="date"] {
  color-scheme: dark;
}

.input-field::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
  transition: opacity 0.2s;
}

.input-field::-webkit-calendar-picker-indicator:hover {
  filter: invert(1);
}

/* Custom Delete Confirmation Modal */
.confirm-modal {
  max-width: 440px;
  padding: 2rem;
  text-align: center;
}

.confirm-modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.delete-warning-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.confirm-modal-body h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
}

.confirm-modal-body p {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.45;
}

.confirm-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  margin-top: 1rem;
  width: 100%;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #f87171, #ef4444);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.45);
}

.modal-footer {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.85rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.modal-footer .modal-btn {
  min-width: 140px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 0.6rem;
  margin: 0;
  box-sizing: border-box;
}
</style>
