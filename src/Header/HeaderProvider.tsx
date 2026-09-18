import React, { createContext, ReactNode, useCallback, useMemo, useState } from 'react'

interface ContextProps {
  headerItem?: ReactNode
  setHeaderItem: (newHeaderMiddleItem: ReactNode) => void
}

export const HeaderContext = createContext<ContextProps>({
  headerItem: undefined,
  setHeaderItem: () => {}
})

interface Props {
  children?: React.ReactNode
}

const HeaderProvider: React.FC<Props> = ({ children }) => {
  const [headerMiddleItem, setHeaderMiddleItem] = useState<ReactNode>(undefined)

  const setHeaderItem = useCallback((newHeaderMiddleItem: ReactNode) => {
    setHeaderMiddleItem(() => newHeaderMiddleItem)
  }, [])

  const contextValue = useMemo(
    () => ({
      headerItem: headerMiddleItem,
      setHeaderItem
    }),
    [headerMiddleItem, setHeaderItem]
  )

  return <HeaderContext.Provider value={contextValue}>{children}</HeaderContext.Provider>
}

export default HeaderProvider
