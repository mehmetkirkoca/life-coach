<template>
  <div class="login-container fade-in">
    <div class="login-box glass-card">
      <div class="login-header text-center mb-6">
        <span class="logo-icon">🌿</span>
        <h2>{{ $t('login.title') }}</h2>
        <p class="subtitle mt-1">{{ $t('login.subtitle') }}</p>
      </div>

      <!-- Quick User Account Switcher Grid -->
      <div class="quick-profiles-section mb-6">
        <h4 class="section-title mb-3">👤 {{ $t('login.selectAccount') }}</h4>

        <div class="user-cards-grid">
          <div
            v-for="u in store.users"
            :key="u._id"
            class="user-login-card"
            @click="handleUserSelect(u)"
          >
            <div class="avatar-circle" :style="{ backgroundColor: u.avatarColor }">
              {{ u.name.charAt(0) }}
            </div>

            <div class="user-meta">
              <span class="user-name">{{ u.name }}</span>
              <span class="user-email">{{ u.email }}</span>
              
              <div class="roles-badges mt-2">
                <span 
                  v-for="role in u.roles" 
                  :key="role" 
                  class="role-tag"
                  :class="role"
                >
                  {{ role === 'coach' ? '💼 Koç' : '👤 Danışan' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="divider mb-6">
        <span>{{ $t('login.orEmail') }}</span>
      </div>

      <!-- Email Login Form -->
      <form @submit.prevent="handleEmailLogin" class="email-form">
        <div class="form-group mb-4">
          <label class="form-label">{{ $t('login.emailLabel') }}</label>
          <input
            v-model="emailInput"
            type="email"
            required
            class="input-field"
            placeholder="ornek@example.com"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block">
          {{ $t('login.loginBtn') }} →
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCoachingStore } from '../stores/coaching'
import type { User } from '../stores/coaching'

const store = useCoachingStore()
const router = useRouter()
const emailInput = ref('')

function handleUserSelect(user: User) {
  store.loginAsUser(user)
  if (user.roles.includes('coach')) {
    router.push('/coach')
  } else {
    router.push('/dashboard')
  }
}

function handleEmailLogin() {
  const found = store.users.find(u => u.email.toLowerCase() === emailInput.value.trim().toLowerCase())
  if (found) {
    handleUserSelect(found)
  } else {
    // Create new temporary client session
    const newUser: User = {
      _id: 'client_' + Math.random().toString(36).substring(2, 7),
      name: emailInput.value.split('@')[0],
      email: emailInput.value,
      roles: ['client'],
      coachId: 'coach_1',
      avatarColor: '#3b82f6'
    }
    store.loginAsUser(newUser)
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.login-container {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.login-box {
  max-width: 580px;
  width: 100%;
  padding: 2.5rem;
  border-radius: 1.25rem;
}

.logo-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.user-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.85rem;
}

.user-login-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-login-card:hover {
  border-color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.08);
  transform: translateY(-2px);
}

.avatar-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-main);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.user-email {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.roles-badges {
  display: flex;
  gap: 0.35rem;
}

.role-tag {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 99px;
}

.role-tag.coach {
  background: rgba(236, 72, 153, 0.15);
  color: #f472b6;
  border: 1px solid rgba(236, 72, 153, 0.3);
}

.role-tag.client {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px dashed var(--border-color);
}

.divider span {
  padding: 0 0.75rem;
}

.input-field {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  outline: none;
}

.input-field:focus {
  border-color: var(--accent-primary);
}

.btn-block {
  width: 100%;
  padding: 0.85rem;
  font-size: 1rem;
}
</style>
