import React, { createContext, useState, useCallback, useEffect } from 'react'
import en from '../locales/en.json'
import id from '../locales/id.json'

export const LanguageContext = createContext()

const translations = {
  en: en,
  id: id,
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'en'
    return localStorage.getItem('language') || 'en'
  })

  const changeLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguage(lang)
      localStorage.setItem('language', lang)
    }
  }, [])

  const t = useCallback((key) => {
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Return the key if translation not found
      }
    }
    
    return value || key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
