import React, { createContext, ReactNode, useCallback, useMemo, useState } from 'react'

interface ContextProps {
  headerItem?: ReactNode
  setHeaderItem: (newHeaderMiddleItem: ReactNode) => void
  isBusy: boolean
  setBusy: (isBusy: boolean) => void
}

export const HeaderContext = createContext<ContextProps>({
  headerItem: undefined,
  setHeaderItem: () => {},
  isBusy: false,
  setBusy: () => {}
})

interface Props {
  children?: React.ReactNode
}

const HeaderProvider: React.FC<Props> = ({ children }) => {
  const [headerMiddleItem, setHeaderMiddleItem] = useState<ReactNode>(undefined)
  const [isBusy, setIsBusy] = useState(false)

  const setHeaderItem = useCallback((newHeaderMiddleItem: ReactNode) => {
    setHeaderMiddleItem(() => newHeaderMiddleItem)
  }, [])

  const setBusy = useCallback((busy: boolean) => setIsBusy(busy), [])

  const contextValue = useMemo(
    () => ({
      headerItem: headerMiddleItem,
      setHeaderItem,
      isBusy,
      setBusy
    }),
    [headerMiddleItem, setHeaderItem, isBusy, setBusy]
  )

  return <HeaderContext.Provider value={contextValue}>{children}</HeaderContext.Provider>
}

export default HeaderProvider
