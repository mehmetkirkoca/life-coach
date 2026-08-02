<template>
  <div class="app-container">
    <NavBar />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCoachingStore } from './stores/coaching'
import NavBar from './components/NavBar.vue'

const { locale } = useI18n()
const store = useCoachingStore()

// Watch the store's locale and sync Vue-i18n reactively (e.g. if updated via MCP)
watch(
  () => store.locale,
  (newLocale) => {
    locale.value = newLocale
  },
  { immediate: true }
)
</script>

<style>
/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
