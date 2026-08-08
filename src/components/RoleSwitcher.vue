<template>
  <div class="role-switcher-container" v-if="store.currentUser">
    <!-- Role Selector Toggle Buttons -->
    <div class="role-toggle-group">
      <button 
        class="role-btn" 
        :class="{ active: store.currentRole === 'client' }"
        @click="handleRoleChange('client')"
        :title="$t('roleSwitcher.clientMode')"
      >
        <User :size="15" />
        <span class="role-label">{{ $t('roleSwitcher.clientMode') }}</span>
      </button>

      <!-- Coach button shown ONLY if user has 'coach' role -->
      <button 
        v-if="hasCoachRole"
        class="role-btn coach" 
        :class="{ active: store.currentRole === 'coach' }"
        @click="handleRoleChange('coach')"
        :title="$t('roleSwitcher.coachMode')"
      >
        <UserCheck :size="15" />
        <span class="role-label">{{ $t('roleSwitcher.coachMode') }}</span>
      </button>
    </div>

    <!-- Active Client Select Dropdown (Shown in Coach Mode for Assigned Clients) -->
    <div class="client-selector" v-if="store.currentRole === 'coach' && clientsList.length > 0">
      <span class="client-select-label">{{ $t('roleSwitcher.activeClient') }}:</span>
      <div class="select-wrapper">
        <select 
          :value="store.activeClientId" 
          @change="onClientSelect"
          class="client-dropdown"
        >
          <option v-for="c in clientsList" :key="c._id" :value="c._id">
            {{ c.name }}
          </option>
        </select>
        <ChevronDown :size="14" class="select-arrow" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, UserCheck, ChevronDown } from 'lucide-vue-next'
import { useCoachingStore } from '../stores/coaching'

const store = useCoachingStore()
const router = useRouter()

const hasCoachRole = computed(() => {
  return store.currentUser?.roles?.includes('coach') || false
})

const clientsList = computed(() => {
  if (store.currentRole === 'coach') {
    return store.assignedClients
  }
  return []
})

function handleRoleChange(role: 'coach' | 'client') {
  store.setRole(role)
  if (role === 'coach') {
    router.push('/coach')
  } else {
    router.push('/dashboard')
  }
}

function onClientSelect(e: Event) {
  const target = e.target as HTMLSelectElement
  if (target.value) {
    store.setActiveClient(target.value)
  }
}
</script>

<style scoped>
.role-switcher-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.3rem 0.6rem;
  border-radius: 99px;
  border: 1px solid var(--border-color);
}

.role-toggle-group {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.2rem;
  border-radius: 99px;
  gap: 0.2rem;
}

.role-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.role-btn:hover {
  color: var(--text-main);
}

.role-btn.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.role-btn.coach.active {
  background: #ec4899;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
}

.client-selector {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border-left: 1px solid var(--border-color);
  padding-left: 0.6rem;
}

.client-select-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.client-dropdown {
  appearance: none;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.25rem 1.6rem 0.25rem 0.65rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}

.client-dropdown:focus {
  border-color: var(--accent-primary);
}

.client-dropdown option {
  background-color: #1a1a24;
  color: #ffffff;
  padding: 0.5rem;
}

.select-arrow {
  position: absolute;
  right: 0.4rem;
  pointer-events: none;
  color: var(--text-muted);
}
</style>
