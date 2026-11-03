import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ru from './locales/ru.json'
import uk from './locales/uk.json'

const defaultLanguage = 'uk'

void i18n.use(initReactI18next).init({
  resources: {
    uk: { translation: uk },
    ru: { translation: ru },
  },
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
})
