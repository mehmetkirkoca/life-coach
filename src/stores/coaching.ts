import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AreaRating {
  current: number
  target: number
}

export type LifeArea = 'health' | 'career' | 'social' | 'family' | 'friendship' | 'finance' | 'spiritual' | 'growth'

export interface KamchiPlan {
  id: string
  area: LifeArea
  subject: string
  goal: string
  status: string
  cure: {
    what: string
    why: string
    how: string
    where: string
    when: string
    who: string
    obstacle: string
  }
  commitment: string
  createdAt: string
}

export const LIFE_AREAS: LifeArea[] = [
  'health',
  'career',
  'social',
  'family',
  'friendship',
  'finance',
  'spiritual',
  'growth'
]

export const AREA_COLORS: Record<LifeArea, string> = {
  health: 'hsl(142, 70%, 45%)',      // Green
  career: 'hsl(217, 91%, 60%)',      // Blue
  social: 'hsl(328, 86%, 56%)',      // Pink/Magenta
  family: 'hsl(280, 67%, 60%)',      // Purple
  friendship: 'hsl(180, 85%, 45%)',  // Teal
  finance: 'hsl(47, 95%, 50%)',      // Gold/Yellow
  spiritual: 'hsl(15, 85%, 55%)',     // Orange
  growth: 'hsl(262, 82%, 60%)'       // Violet
}

export interface ColorScores {
  red: number
  yellow: number
  green: number
  blue: number
}

export interface ColorPercentages {
  red: number
  yellow: number
  green: number
  blue: number
}

export const useCoachingStore = defineStore('coaching', () => {
  const API_URL = 'http://localhost:3000/api/state'

  // Active locale
  const locale = ref(localStorage.getItem('locale') || 'tr')

  // 1. Assessment ratings
  const ratings = ref<Record<LifeArea, AreaRating>>({
    health: { current: 5, target: 8 },
    career: { current: 5, target: 8 },
    social: { current: 5, target: 8 },
    family: { current: 5, target: 8 },
    friendship: { current: 5, target: 8 },
    finance: { current: 5, target: 8 },
    spiritual: { current: 5, target: 8 },
    growth: { current: 5, target: 8 }
  })

  const ratingsSaved = ref(false)

  // Load initial from localStorage
  const savedRatings = localStorage.getItem('coaching_ratings')
  if (savedRatings) {
    try {
      ratings.value = JSON.parse(savedRatings)
      ratingsSaved.value = true
    } catch (e) {
      console.error('Failed to parse ratings from local storage', e)
    }
  }

  function saveRatings(newRatings: Record<LifeArea, AreaRating>) {
    ratings.value = { ...newRatings }
    localStorage.setItem('coaching_ratings', JSON.stringify(ratings.value))
    ratingsSaved.value = true
    syncToApi()
  }

  // 2. Core Values
  const selectedValues = ref<string[]>([])
  
  const savedValues = localStorage.getItem('coaching_values')
  if (savedValues) {
    try {
      selectedValues.value = JSON.parse(savedValues)
    } catch (e) {
      console.error('Failed to parse values from local storage', e)
    }
  }

  function saveValues(values: string[]) {
    selectedValues.value = [...values]
    localStorage.setItem('coaching_values', JSON.stringify(selectedValues.value))
    syncToApi()
  }

  // 3. KAMÇI Plans
  const plans = ref<KamchiPlan[]>([])

  const savedPlans = localStorage.getItem('coaching_plans')
  if (savedPlans) {
    try {
      plans.value = JSON.parse(savedPlans)
    } catch (e) {
      console.error('Failed to parse plans from local storage', e)
    }
  }

  function savePlan(plan: Omit<KamchiPlan, 'id' | 'createdAt'> & { id?: string }) {
    if (plan.id) {
      const idx = plans.value.findIndex(p => p.id === plan.id)
      if (idx !== -1) {
        plans.value[idx] = {
          ...plans.value[idx],
          ...plan,
          id: plan.id
        }
      }
    } else {
      const newPlan: KamchiPlan = {
        ...plan,
        id: 'plan_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toLocaleDateString('tr-TR')
      }
      plans.value.push(newPlan)
    }
    localStorage.setItem('coaching_plans', JSON.stringify(plans.value))
    syncToApi()
  }

  function deletePlan(id: string) {
    plans.value = plans.value.filter(p => p.id !== id)
    localStorage.setItem('coaching_plans', JSON.stringify(plans.value))
    syncToApi()
  }

  // 4. Color Personality Test
  const colorAnswers = ref<Record<number, Record<'red' | 'yellow' | 'green' | 'blue', number>>>({})
  const colorCompleted = ref(false)

  const savedColorAnswers = localStorage.getItem('coaching_color_answers')
  if (savedColorAnswers) {
    try {
      colorAnswers.value = JSON.parse(savedColorAnswers)
      colorCompleted.value = Object.keys(colorAnswers.value).length >= 16
    } catch (e) {
      console.error('Failed to parse color answers from local storage', e)
    }
  }

  const colorScores = computed<ColorScores>(() => {
    const totals: ColorScores = { red: 0, yellow: 0, green: 0, blue: 0 }
    Object.values(colorAnswers.value).forEach(ans => {
      totals.red += ans.red || 0
      totals.yellow += ans.yellow || 0
      totals.green += ans.green || 0
      totals.blue += ans.blue || 0
    })
    return totals
  })

  const colorPercentages = computed<ColorPercentages>(() => {
    const scores = colorScores.value
    const total = scores.red + scores.yellow + scores.green + scores.blue
    if (total === 0) {
      return { red: 0, yellow: 0, green: 0, blue: 0 }
    }
    return {
      red: Number(((scores.red / total) * 100).toFixed(1)),
      yellow: Number(((scores.yellow / total) * 100).toFixed(1)),
      green: Number(((scores.green / total) * 100).toFixed(1)),
      blue: Number(((scores.blue / total) * 100).toFixed(1))
    }
  })

  function saveColorAnswer(questionId: number, answerScores: Record<'red' | 'yellow' | 'green' | 'blue', number>) {
    colorAnswers.value[questionId] = answerScores
    localStorage.setItem('coaching_color_answers', JSON.stringify(colorAnswers.value))
    if (Object.keys(colorAnswers.value).length >= 16) {
      colorCompleted.value = true
    }
    syncToApi()
  }

  function resetColorTest() {
    colorAnswers.value = {}
    colorCompleted.value = false
    localStorage.removeItem('coaching_color_answers')
    syncToApi()
  }

  // Language update
  function saveLocale(code: string) {
    locale.value = code
    localStorage.setItem('locale', code)
    syncToApi()
  }

  // Helper checks
  const isAssessmentCompleted = computed(() => {
    return ratingsSaved.value
  })

  const isValuesCompleted = computed(() => {
    return selectedValues.value.length === 5
  })

  const isColorTestCompleted = computed(() => {
    return colorCompleted.value
  })

  // ----------------------------------------------------
  // Sync API Integration
  // ----------------------------------------------------
  const isInitialized = ref(false)

  async function syncFromApi() {
    try {
      const res = await fetch(API_URL)
      if (res.ok) {
        const data = await res.json()
        if (data.locale) {
          locale.value = data.locale
          localStorage.setItem('locale', data.locale)
        }
        if (data.ratings && Object.keys(data.ratings).length > 0) {
          ratings.value = data.ratings
          localStorage.setItem('coaching_ratings', JSON.stringify(data.ratings))
          ratingsSaved.value = true
        }
        if (data.values) {
          selectedValues.value = data.values
          localStorage.setItem('coaching_values', JSON.stringify(data.values))
        }
        if (data.plans) {
          plans.value = data.plans
          localStorage.setItem('coaching_plans', JSON.stringify(data.plans))
        }
        if (data.colorAnswers) {
          colorAnswers.value = data.colorAnswers
          localStorage.setItem('coaching_color_answers', JSON.stringify(data.colorAnswers))
          colorCompleted.value = Object.keys(data.colorAnswers).length >= 16
        }
        console.log('[MCP Sync] Synchronized coaching data successfully.')
      }
    } catch (err) {
      console.log('[MCP Sync] Local MCP server not running. Operating in offline localStorage mode.')
    } finally {
      isInitialized.value = true
    }
  }

  async function syncToApi() {
    if (!isInitialized.value) {
      console.log('[MCP Sync] syncToApi blocked: Store not initialized yet.')
      return
    }
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: locale.value,
          ratings: ratings.value,
          values: selectedValues.value,
          plans: plans.value,
          colorAnswers: colorAnswers.value
        })
      })
    } catch (err) {
      // Ignore background sync errors when server is offline
    }
  }

  // Perform initial synchronization check
  syncFromApi()

  // Poll server state every 5 seconds for live reactivity with MCP
  if (typeof window !== 'undefined') {
    setInterval(syncFromApi, 5000)
  }

  return {
    locale,
    saveLocale,
    ratings,
    ratingsSaved,
    saveRatings,
    selectedValues,
    saveValues,
    plans,
    savePlan,
    deletePlan,
    colorAnswers,
    colorCompleted,
    colorScores,
    colorPercentages,
    saveColorAnswer,
    resetColorTest,
    isAssessmentCompleted,
    isValuesCompleted,
    isColorTestCompleted,
    syncFromApi
  }
})
