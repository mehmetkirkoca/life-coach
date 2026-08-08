<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link :to="store.currentRole === 'coach' ? '/coach' : '/dashboard'" class="logo">
        <span class="logo-text">Life COACH</span>
      </router-link>
    </div>

    <!-- Navigation links filtered by active role ('coach' vs 'client') -->
    <div class="nav-links" v-if="store.currentUser">
      <!-- Client specific menus shown ONLY when 'client' role mode is active -->
      <template v-if="store.currentRole === 'client'">
        <router-link to="/colors" class="nav-item">
          {{ $t('nav.colors') }}
        </router-link>
        <router-link to="/assessment" class="nav-item">
          {{ $t('nav.assessment') }}
        </router-link>
        <router-link to="/kamchi" class="nav-item">
          {{ $t('nav.kamchi') }}
        </router-link>
        <router-link to="/values" class="nav-item">
          {{ $t('nav.values') }}
        </router-link>
      </template>
    </div>

    <div class="nav-actions">
      <!-- Role and Client Switcher -->
      <RoleSwitcher v-if="store.currentUser" />

      <!-- User Profile / Logout Button -->
      <div v-if="store.currentUser" class="user-profile-badge" @click="handleLogout" title="Çıkış Yap / Profil Değiştir">
        <div class="mini-avatar" :style="{ backgroundColor: store.currentUser.avatarColor }">
          {{ store.currentUser.name.charAt(0) }}
        </div>
        <span class="user-display-name">{{ store.currentUser.name }}</span>
        <LogOut :size="14" class="logout-icon" />
      </div>

      <!-- Locale Selector -->
      <div class="lang-dropdown">
        <button @click="toggleLangMenu" class="lang-btn">
          <span>{{ currentLocale.flag }}</span>
          <span>{{ currentLocale.code.toUpperCase() }}</span>
          <span class="chevron">▾</span>
        </button>

        <div v-if="showLangMenu" class="lang-menu">
          <button
            v-for="loc in SUPPORTED_LOCALES"
            :key="loc.code"
            @click="selectLocale(loc.code)"
            class="lang-menu-item"
            :class="{ active: locale === loc.code }"
          >
            <span>{{ loc.flag }}</span>
            <span>{{ loc.label }}</span>
            <span v-if="locale === loc.code" class="check">✓</span>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Overlay to close menu -->
  <div v-if="showLangMenu" class="lang-overlay" @click="showLangMenu = false" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LogOut } from 'lucide-vue-next'
import { SUPPORTED_LOCALES } from '../locales'
import { useCoachingStore } from '../stores/coaching'
import RoleSwitcher from './RoleSwitcher.vue'

const { locale } = useI18n()
const store = useCoachingStore()
const router = useRouter()
const showLangMenu = ref(false)

const currentLocale = computed(
  () => SUPPORTED_LOCALES.find((l) => l.code === locale.value) ?? SUPPORTED_LOCALES[0]
)

function toggleLangMenu() {
  showLangMenu.value = !showLangMenu.value
}

function selectLocale(code: string) {
  locale.value = code
  store.saveLocale(code)
  showLangMenu.value = false
}

function handleLogout() {
  store.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--bg-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-main);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.03em;
}

.nav-links {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.nav-item {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.45rem 0.85rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}
.nav-item:hover {
  color: var(--text-main);
  background: hsla(var(--hue), 20%, 80%, 0.04);
}
.router-link-active.nav-item {
  color: #fff;
  background: var(--accent-primary-glow);
  box-shadow: inset 0 0 0 1px var(--accent-primary);
}
.nav-item.coach-item.router-link-active {
  background: rgba(236, 72, 153, 0.15);
  box-shadow: inset 0 0 0 1px #ec4899;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.user-profile-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color);
  padding: 0.3rem 0.6rem;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-profile-badge:hover {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.mini-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
}

.user-display-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
}

.logout-icon {
  color: var(--text-muted);
  transition: color 0.2s;
}

.user-profile-badge:hover .logout-icon {
  color: #ef4444;
}

.lang-dropdown {
  position: relative;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 0.45rem 0.85rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}
.lang-btn:hover {
  color: var(--text-main);
  border-color: var(--border-color-hover);
}

.chevron {
  font-size: 0.8rem;
  opacity: 0.7;
}

.lang-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  background: hsl(var(--hue), 24%, 10%);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  min-width: 140px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  z-index: 101;
}

.lang-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}
.lang-menu-item:hover {
  background: hsla(var(--hue), 20%, 80%, 0.05);
  color: var(--text-main);
}
.lang-menu-item.active {
  color: var(--text-main);
  font-weight: 500;
}

.check {
  margin-left: auto;
  color: var(--accent-secondary);
  font-size: 0.8rem;
}

.lang-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}
</style>
