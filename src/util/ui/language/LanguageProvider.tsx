import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const languageStorageKey = 'inv-language'

interface ContextProps {
  germanNames: boolean
  toggleLanguage: () => void
}

export const LanguageContext = createContext<ContextProps>({
  germanNames: false,
  toggleLanguage: () => {}
})

interface Props {
  children?: React.ReactNode
}

const preferredLanguage = (): boolean => {
  try {
    return window.localStorage.getItem(languageStorageKey) == 'de'
  } catch {
    return false
  }
}

const LanguageProvider: React.FC<Props> = ({ children }) => {
  const [germanNames, setGermanNames] = useState(preferredLanguage)

  useEffect(() => {
    try {
      window.localStorage.setItem(languageStorageKey, germanNames ? 'de' : 'en')
    } catch {
      return
    }
  }, [germanNames])

  const toggleLanguage = useCallback(() => setGermanNames((previous) => !previous), [])

  const contextValue = useMemo(() => ({ germanNames, toggleLanguage }), [germanNames, toggleLanguage])

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

interface LocalizableName {
  name: string
  germanName?: string
}

export const localizedName = (named: LocalizableName, germanNames: boolean): string =>
  germanNames ? (named.germanName ?? named.name) : named.name

export const useLocalizedName = (named: LocalizableName): string => localizedName(named, useContext(LanguageContext).germanNames)

export default LanguageProvider
