import { useEffect, useState } from 'react'

const mobileBreakpointQuery = '(max-width: 1179px)'

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(mobileBreakpointQuery).matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileBreakpointQuery)
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
