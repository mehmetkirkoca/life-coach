import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export type LifeArea =
  | 'health'
  | 'career'
  | 'social'
  | 'family'
  | 'friendship'
  | 'finance'
  | 'spiritual'
  | 'growth'

export interface AreaRating {
  current: number
  target: number
}

export const AREA_COLORS: Record<LifeArea, string> = {
  health: '#ef4444',
  career: '#3b82f6',
  social: '#ec4899',
  family: '#f59e0b',
  friendship: '#10b981',
  finance: '#8b5cf6',
  spiritual: '#06b6d4',
  growth: '#6366f1'
}

export interface CureDetails {
  what: string
  why: string
  how: string
  where: string
  when: string
  who: string
  obstacle: string
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

export interface KamchiPlan {
  id: string
  area: LifeArea
  subject: string
  goal: string
  status: string
  cure: CureDetails
  commitment: string
  createdAt: string
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

export interface User {
  _id: string
  name: string
  email: string
  roles: Array<'coach' | 'client'>
  coachId?: string
  avatarColor: string
}

export interface SessionNote {
  id: string
  clientId: string
  coachId: string
  title: string
  content: string
  date: string
  actionItems: string[]
  tags: string[]
}

export interface CoachFeedbackCategoryRatings {
  communication: number
  guidance: number
  motivation: number
}

export interface CoachFeedback {
  id: string
  clientId: string
  coachId: string
  clientName?: string
  rating: number
  categories: CoachFeedbackCategoryRatings
  title: string
  comment: string
  date: string
  createdAt?: string
}

export const useCoachingStore = defineStore('coaching', () => {
  const BASE_URL = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000'

  // Current Logged-in User Session
  const currentUser = ref<User | null>(
    localStorage.getItem('coaching_user')
      ? JSON.parse(localStorage.getItem('coaching_user')!)
      : null
  )

  // Active role & client management
  const currentRole = ref<'coach' | 'client'>((localStorage.getItem('coaching_role') as 'coach' | 'client') || 'client')
  const activeClientId = ref<string>(localStorage.getItem('coaching_active_client') || 'client_1')
  const users = ref<User[]>([])
  const sessionNotes = ref<SessionNote[]>([])
  const coachFeedbacks = ref<CoachFeedback[]>([])

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

  // 2. Core Values
  const selectedValues = ref<string[]>([])

  // 3. KAMÇI Plans
  const plans = ref<KamchiPlan[]>([])

  // 4. Color Personality Test
  const colorAnswers = ref<Record<number, Record<'red' | 'yellow' | 'green' | 'blue', number>>>({})
  const colorCompleted = ref(false)

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
    const total = (scores.red + scores.yellow + scores.green + scores.blue) || 1
    return {
      red: Math.round((scores.red / total) * 1000) / 10,
      yellow: Math.round((scores.yellow / total) * 1000) / 10,
      green: Math.round((scores.green / total) * 1000) / 10,
      blue: Math.round((scores.blue / total) * 1000) / 10
    }
  })

  // Assigned Clients for logged-in Coach (1-to-N Relationship)
  const assignedClients = computed(() => {
    if (!currentUser.value) return []
    if (currentUser.value.roles.includes('coach')) {
      return users.value.filter(u => u.coachId === currentUser.value!._id)
    }
    return []
  })

  // Login & Session Management
  function loginAsUser(user: User) {
    currentUser.value = user
    localStorage.setItem('coaching_user', JSON.stringify(user))

    if (user.roles.includes('coach')) {
      setRole('coach')
    } else {
      setRole('client')
      setActiveClient(user._id)
    }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('coaching_user')
    localStorage.removeItem('coaching_role')
    localStorage.removeItem('coaching_active_client')
  }

  function setRole(role: 'coach' | 'client') {
    if (role === 'coach' && currentUser.value && !currentUser.value.roles.includes('coach')) {
      return
    }
    currentRole.value = role
    localStorage.setItem('coaching_role', role)

    if (role === 'coach') {
      const myClients = assignedClients.value
      if (myClients.length > 0 && !myClients.some(c => c._id === activeClientId.value)) {
        setActiveClient(myClients[0]._id)
      }
    } else if (currentUser.value && currentUser.value.roles.includes('client')) {
      setActiveClient(currentUser.value._id)
    }
  }

  function setActiveClient(clientId: string) {
    activeClientId.value = clientId
    localStorage.setItem('coaching_active_client', clientId)
    syncFromApi()
    fetchSessionNotes(clientId)
    fetchCoachFeedbacks(undefined, clientId)
  }

  async function fetchUsers() {
    try {
      const res = await fetch(`${BASE_URL}/api/users`)
      if (res.ok) {
        users.value = await res.json()
        if (currentUser.value) {
          const freshUser = users.value.find(u => u._id === currentUser.value!._id)
          if (freshUser) {
            currentUser.value = freshUser
            localStorage.setItem('coaching_user', JSON.stringify(freshUser))
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch users:', e)
    }
  }

  // Session Notes CRUD
  async function fetchSessionNotes(clientId?: string) {
    const targetClient = clientId || activeClientId.value
    try {
      const res = await fetch(`${BASE_URL}/api/notes?clientId=${targetClient}`)
      if (res.ok) {
        sessionNotes.value = await res.json()
      }
    } catch (e) {
      console.error('Failed to fetch session notes:', e)
    }
  }

  async function saveSessionNote(note: Partial<SessionNote>) {
    try {
      const noteData = {
        ...note,
        clientId: note.clientId || activeClientId.value,
        coachId: note.coachId || currentUser.value?._id || 'coach_1',
        date: note.date || new Date().toLocaleDateString('tr-TR')
      }
      const res = await fetch(`${BASE_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      })
      if (res.ok) {
        await fetchSessionNotes()
      }
    } catch (e) {
      console.error('Failed to save session note:', e)
    }
  }

  async function deleteSessionNote(noteId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/notes?id=${noteId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchSessionNotes()
      }
    } catch (e) {
      console.error('Failed to delete session note:', e)
    }
  }

  // Coach Feedbacks CRUD (Evaluations & Ratings)
  async function fetchCoachFeedbacks(coachId?: string, clientId?: string) {
    try {
      const params = new URLSearchParams()
      if (coachId) params.append('coachId', coachId)
      if (clientId) params.append('clientId', clientId)
      const queryStr = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`${BASE_URL}/api/feedbacks${queryStr}`)
      if (res.ok) {
        coachFeedbacks.value = await res.json()
      }
    } catch (e) {
      console.error('Failed to fetch coach feedbacks:', e)
    }
  }

  async function saveCoachFeedback(feedback: Partial<CoachFeedback>) {
    try {
      const client = currentUser.value
      const fbData = {
        ...feedback,
        clientId: feedback.clientId || client?._id || activeClientId.value,
        coachId: feedback.coachId || client?.coachId || 'coach_1',
        clientName: feedback.clientName || client?.name || 'Danışan',
        date: feedback.date || new Date().toLocaleDateString('tr-TR')
      }
      const res = await fetch(`${BASE_URL}/api/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fbData)
      })
      if (res.ok) {
        await fetchCoachFeedbacks()
      }
    } catch (e) {
      console.error('Failed to save coach feedback:', e)
    }
  }

  async function deleteCoachFeedback(feedbackId: string) {
    try {
      const res = await fetch(`${BASE_URL}/api/feedbacks?id=${feedbackId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchCoachFeedbacks()
      }
    } catch (e) {
      console.error('Failed to delete coach feedback:', e)
    }
  }

  // Computed feedback for the currently active/logged-in client
  const clientCoachFeedback = computed<CoachFeedback | null>(() => {
    const currentClient = currentUser.value
    if (!currentClient) return null
    const cId = currentClient._id
    const coachId = currentClient.coachId || 'coach_1'
    return coachFeedbacks.value.find(f => f.clientId === cId && f.coachId === coachId) || null
  })

  // Computed average rating for the coach
  const coachAverageRating = computed<{ average: number; count: number }>(() => {
    const coachId = currentUser.value?.roles.includes('coach') ? currentUser.value._id : 'coach_1'
    const list = coachFeedbacks.value.filter(f => f.coachId === coachId)
    if (list.length === 0) return { average: 5.0, count: 0 }
    const sum = list.reduce((acc, curr) => acc + (curr.rating || 5), 0)
    return {
      average: Math.round((sum / list.length) * 10) / 10,
      count: list.length
    }
  })

  function saveRatings(newRatings: Record<LifeArea, AreaRating>) {
    ratings.value = { ...newRatings }
    ratingsSaved.value = true
    syncToApi()
  }

  function saveValues(newValues: string[]) {
    selectedValues.value = [...newValues]
    syncToApi()
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
    syncToApi()
  }

  function deletePlan(id: string) {
    plans.value = plans.value.filter(p => p.id !== id)
    syncToApi()
  }

  function saveColorAnswer(questionId: number, answerScores: Record<'red' | 'yellow' | 'green' | 'blue', number>) {
    colorAnswers.value[questionId] = answerScores
    if (Object.keys(colorAnswers.value).length >= 16) {
      colorCompleted.value = true
    }
    syncToApi()
  }

  function resetColorTest() {
    colorAnswers.value = {}
    colorCompleted.value = false
    syncToApi()
  }

  function saveLocale(code: string) {
    locale.value = code
    localStorage.setItem('locale', code)
    syncToApi()
  }

  // Computed checks
  const isAssessmentCompleted = computed(() => ratingsSaved.value)
  const isValuesCompleted = computed(() => selectedValues.value.length === 5)
  const isColorTestCompleted = computed(() => colorCompleted.value || Object.keys(colorAnswers.value).length >= 16)

  // Sync API Integration
  const isInitialized = ref(false)

  async function syncFromApi() {
    try {
      const res = await fetch(`${BASE_URL}/api/state?userId=${activeClientId.value}`)
      if (res.ok) {
        const data = await res.json()
        if (data.locale) {
          locale.value = data.locale
          localStorage.setItem('locale', data.locale)
        }
        if (data.ratings && Object.keys(data.ratings).length > 0) {
          ratings.value = data.ratings
          ratingsSaved.value = true
        } else {
          ratingsSaved.value = false
        }
        selectedValues.value = data.values || []
        plans.value = data.plans || []
        colorAnswers.value = data.colorAnswers || {}
        colorCompleted.value = Object.keys(colorAnswers.value).length >= 16
      }
    } catch (err) {
      console.log('[MCP Sync] Server sync offline.')
    } finally {
      isInitialized.value = true
    }
  }

  async function syncToApi() {
    if (!isInitialized.value) return
    try {
      await fetch(`${BASE_URL}/api/state?userId=${activeClientId.value}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeClientId.value,
          locale: locale.value,
          ratings: ratings.value,
          values: selectedValues.value,
          plans: plans.value,
          colorAnswers: colorAnswers.value
        })
      })
    } catch (err) {}
  }

  // Initial loads
  fetchUsers()
  syncFromApi()
  fetchSessionNotes()
  fetchCoachFeedbacks()

  if (typeof window !== 'undefined') {
    setInterval(syncFromApi, 5000)
  }

  return {
    currentUser,
    currentRole,
    activeClientId,
    users,
    assignedClients,
    sessionNotes,
    coachFeedbacks,
    clientCoachFeedback,
    coachAverageRating,
    loginAsUser,
    logout,
    setRole,
    setActiveClient,
    fetchUsers,
    fetchSessionNotes,
    saveSessionNote,
    deleteSessionNote,
    fetchCoachFeedbacks,
    saveCoachFeedback,
    deleteCoachFeedback,
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
