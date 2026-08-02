<template>
  <div class="main-content fade-in">
    <header class="mb-8 header-with-action">
      <div>
        <h1>{{ $t('values.title') }}</h1>
        <p class="subtitle mt-1">{{ $t('values.subtitle') }}</p>
      </div>
      <router-link to="/dashboard" class="btn btn-secondary btn-sm">
        ← {{ $t('nav.dashboard') }}
      </router-link>
    </header>

    <div class="values-layout">
      <!-- Left Panel: Selected and Actions -->
      <div class="glass-card selection-panel">
        <h3>{{ $t('values.selectedTitle', { count: selected.length }) }}</h3>
        
        <div class="selected-box mt-4">
          <transition-group name="list" tag="div" class="selected-list">
            <div 
              v-for="(val, index) in selected" 
              :key="val" 
              class="selected-item-card"
              @click="toggleValue(val)"
            >
              <span class="rank">#{{ index + 1 }}</span>
              <span class="name">{{ $t(`values.list.${val}`) }}</span>
              <span class="remove-btn">×</span>
            </div>
            <div v-if="selected.length === 0" key="empty" class="empty-selection">
              <span class="hint-icon">💎</span>
              <p>{{ $t('values.emptyHint') }}</p>
            </div>
          </transition-group>
        </div>

        <div class="auto-save-info mt-4 text-center">
          <p class="hint-text" :class="{ 'text-success': selected.length === 5 }">
            {{ selected.length === 5 ? $t('values.savedSuccess') : $t('values.selectRemaining', { remaining: 5 - selected.length }) }}
          </p>
        </div>
      </div>

      <!-- Right Panel: Grid of all values -->
      <div class="glass-card values-pool-panel">
        <h3>{{ $t('values.listTitle') }}</h3>
        
        <div class="values-grid mt-4">
          <button
            v-for="val in ALL_VALUES"
            :key="val"
            class="value-card-btn"
            :class="{ 
              active: selected.includes(val),
              disabled: selected.length >= 5 && !selected.includes(val) 
            }"
            @click="toggleValue(val)"
          >
            <div class="value-card-content">
              <span class="check-box" v-if="selected.includes(val)">✓</span>
              <span class="value-name">{{ $t(`values.list.${val}`) }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCoachingStore } from '../stores/coaching'

const store = useCoachingStore()

const ALL_VALUES = [
  'honesty', 'personal_development', 'food', 'sharing', 'truthfulness',
  'justice', 'fun', 'enlightening', 'creating_benefit', 'commitment',
  'achieving', 'repairing', 'environment', 'doing_right_thing', 'satisfaction',
  'sports', 'being_beautiful', 'equality', 'advancing_action', 'self_sacrifice',
  'health', 'appearance', 'partner', 'romance', 'laughing',
  'winning', 'openness', 'image', 'leisure_time', 'seruven',
  'independence', 'happiness', 'love', 'joy', 'social_acceptance',
  'leadership', 'integrity_word_deed', 'loyalty', 'partnership', 'entrepreneurship',
  'family', 'money', 'children', 'art', 'vitality',
  'relatives', 'team_spirit', 'attaining', 'simplicity', 'macera',
  'safety', 'privacy', 'uniqueness', 'social_development', 'self_confidence',
  'power', 'goodness', 'self_transcendence', 'problem_solving', 'using_my_abilities',
  'visionary', 'peace', 'innovativeness', 'integrity', 'faith',
  'individuality', 'freedom', 'respect', 'patriotism', 'being_orderly',
  'discipline', 'conservatism', 'creativity', 'learning', 'emotionality',
  'contributing', 'producing', 'career', 'managing', 'traveling',
  'community', 'neighborliness', 'teaching', 'love_of_animals', 'candidness',
  'continuity', 'balance', 'friendship', 'being_appreciated', 'diligence',
  'being_right', 'sensitivity', 'helpfulness', 'modernity', 'dedication',
  'being_loved', 'competence', 'fame', 'calmness', 'courage'
]

const selected = ref<string[]>([...store.selectedValues])

function toggleValue(val: string) {
  const index = selected.value.indexOf(val)
  if (index >= 0) {
    // Remove
    selected.value.splice(index, 1)
  } else {
    // Add only if less than 5
    if (selected.value.length < 5) {
      selected.value.push(val)
    }
  }
}

// Watch selected values deeply and save instantly to the Pinia store / localStorage
watch(
  selected,
  (newVal) => {
    store.saveValues(newVal)
  },
  { deep: true }
)
</script>

<style scoped>
.subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
}

.values-layout {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1.5rem;
}
@media (max-width: 992px) {
  .values-layout {
    grid-template-columns: 1fr;
  }
}

.selection-panel {
  display: flex;
  flex-direction: column;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.selected-box {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1rem;
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.selected-item-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.selected-item-card:hover {
  border-color: var(--accent-danger);
  background: rgba(239, 68, 68, 0.04);
}
.selected-item-card:hover .remove-btn {
  color: var(--accent-danger);
  transform: scale(1.2);
}

.rank {
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--accent-secondary);
}

.name {
  font-weight: 500;
}

.remove-btn {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 1.2rem;
  transition: all 0.2s;
}

.empty-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  color: var(--text-muted);
}
.hint-icon {
  font-size: 2.5rem;
  opacity: 0.3;
  margin-bottom: 0.5rem;
}

.hint-text {
  font-size: 0.85rem;
  color: var(--text-muted);
  transition: color 0.2s;
}

.text-success {
  color: var(--accent-success) !important;
  font-weight: 500;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
}

.value-card-btn {
  background: hsla(var(--hue), 20%, 80%, 0.02);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.5rem 0.25rem;
  border-radius: 0.75rem;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.2s;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.value-card-btn:hover:not(.disabled) {
  border-color: var(--accent-secondary);
  background: hsla(var(--hue), 20%, 80%, 0.05);
  transform: translateY(-2px);
}
.value-card-btn.active {
  border-color: var(--accent-secondary);
  background: var(--accent-secondary-glow);
  box-shadow: 0 0 12px var(--accent-secondary-glow);
}
.value-card-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.check-box {
  display: block;
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--accent-secondary);
  margin-bottom: 0.25rem;
}

.value-name {
  font-weight: 500;
  font-size: 0.9rem;
}

/* Animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
