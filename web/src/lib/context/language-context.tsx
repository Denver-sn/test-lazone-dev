"use client"
import { createContext, useContext, useState, ReactNode } from "react"
import {
  Language,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from "../constants/languages"

type LanguageContextType = {
  currentLanguage: Language
  setLanguage: (lang: Language) => void
  formatPrice: (amount: number) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] =
    useState<Language>(DEFAULT_LANGUAGE)

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(currentLanguage.code, {
      style: "currency",
      currency: currentLanguage.currency,
    }).format(amount)
  }

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage: setCurrentLanguage,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
