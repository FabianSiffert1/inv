import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export const themeStorageKey = 'inv-theme'

interface ContextProps {
  darkTheme: boolean
  toggleTheme: () => void
}

export const ThemeContext = createContext<ContextProps>({
  darkTheme: true,
  toggleTheme: () => {}
})

interface Props {
  children?: React.ReactNode
}

const readStoredTheme = (): 'dark' | 'light' | undefined => {
  try {
    const stored = window.localStorage.getItem(themeStorageKey)
    return stored == 'dark' || stored == 'light' ? stored : undefined
  } catch {
    return undefined
  }
}

const preferredTheme = (): boolean =>
  readStoredTheme() ? readStoredTheme() == 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches

const ThemeProvider: React.FC<Props> = ({ children }) => {
  const [darkTheme, setDarkTheme] = useState(preferredTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkTheme ? 'dark' : 'light')
    try {
      window.localStorage.setItem(themeStorageKey, darkTheme ? 'dark' : 'light')
    } catch {
      return
    }
  }, [darkTheme])

  useEffect(() => {
    if (readStoredTheme() != undefined) {
      return
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setDarkTheme(event.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  const toggleTheme = useCallback(() => setDarkTheme((previous) => !previous), [])

  const contextValue = useMemo(() => ({ darkTheme, toggleTheme }), [darkTheme, toggleTheme])

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
