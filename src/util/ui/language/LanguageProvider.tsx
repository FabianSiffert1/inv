import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PokemonCard } from '../../api/pokemonTGC/model/PokemonCard'

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

export const useCardName = (card: PokemonCard): string => {
  const { germanNames } = useContext(LanguageContext)
  return germanNames ? (card.germanName ?? card.name) : card.name
}

export default LanguageProvider
