import { useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export interface CardNavigation {
  openCardId?: string
  openCard: (cardId: string) => void
  stepToCard: (cardId: string) => void
  closeCard: () => void
}

export const noBaseParams: Record<string, string> = {}

export const useCardNavigation = (baseParams?: Record<string, string>): CardNavigation => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const openCardId = searchParams.get('card') ?? undefined

  const openCard = useCallback(
    (cardId: string) => {
      if (baseParams != undefined) {
        setSearchParams({ ...baseParams, card: cardId }, { state: { openedInApp: true } })
      }
    },
    [baseParams, setSearchParams]
  )

  const stepToCard = useCallback(
    (cardId: string) => {
      if (baseParams != undefined) {
        setSearchParams({ ...baseParams, card: cardId }, { replace: true, state: location.state })
      }
    },
    [baseParams, setSearchParams, location.state]
  )

  const closeCard = useCallback(() => {
    if ((location.state as { openedInApp?: boolean } | null)?.openedInApp) {
      navigate(-1)
    } else if (baseParams != undefined) {
      setSearchParams(baseParams, { replace: true })
    }
  }, [location.state, navigate, baseParams, setSearchParams])

  return { openCardId, openCard, stepToCard, closeCard }
}
