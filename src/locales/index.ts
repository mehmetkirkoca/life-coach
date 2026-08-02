import { createI18n } from 'vue-i18n'
import tr from './tr'
import en from './en'

export const SUPPORTED_LOCALES = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' }
]

const savedLocale = localStorage.getItem('locale') || 'tr'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    tr,
    en
  }
})
