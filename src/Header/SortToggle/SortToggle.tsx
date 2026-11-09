import { ReactElement, useCallback, useContext, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import { SortContext, SortMode, sortModes } from '../../util/ui/sort/SortProvider'
import { useDismissable } from '../../util/ui/useDismissable'
import { ArrowDownIcon, CalendarIcon, CoinIcon, GemIcon, HashIcon, PikaTextIcon, UrgencyIcon } from './SortIcons'
import styles from './SortToggle.module.scss'

const sortModeIcons: Record<SortMode, ReactElement> = {
  price: <CoinIcon />,
  number: <HashIcon />,
  name: <PikaTextIcon />,
  rarity: <GemIcon />,
  release: <CalendarIcon />,
  urgency: <UrgencyIcon />
}

const isSingleSetPath = (pathname: string): boolean => pathname == '/' || pathname.startsWith('/market')

const isInventoryPath = (pathname: string): boolean => pathname.startsWith('/inventory')

const isAvailableMode = (mode: SortMode, pathname: string): boolean =>
  mode == 'release' ? !isSingleSetPath(pathname) : mode == 'urgency' ? isInventoryPath(pathname) : true

export default function SortToggle() {
  const { sortMode, isReversed, selectSortMode, toggleSortDirection } = useContext(SortContext)
  const location = useLocation()
  const availableModes = sortModes.filter((mode) => isAvailableMode(mode, location.pathname))
  const t = useStrings()
  const [isOpen, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismissable(isOpen, close, wrapperRef, triggerRef)

  const label = `${t.sort}: ${t.sortModes[sortMode]}`
  const [defaultOrder, reversedOrder] = t.sortOrders[sortMode]
  const directionLabel = isReversed ? t.sortDirectionLabel(reversedOrder, defaultOrder) : t.sortDirectionLabel(defaultOrder, reversedOrder)

  return (
    <div className={styles.sortControls}>
      <div className={styles.sortMenu} ref={wrapperRef}>
        <button
          ref={triggerRef}
          type='button'
          className={styles.sortToggle}
          onClick={() => setOpen((previous) => !previous)}
          aria-label={label}
          title={label}
          aria-expanded={isOpen}
          aria-haspopup='menu'
        >
          {sortModeIcons[sortMode]}
        </button>
        {isOpen && (
          <div className={styles.panel} role='menu' aria-label={t.sort}>
            {availableModes.map((mode) => {
              const isCurrent = mode == sortMode
              return (
                <button
                  key={mode}
                  type='button'
                  role='menuitemradio'
                  aria-checked={isCurrent}
                  className={isCurrent ? `${styles.row} ${styles.rowCurrent}` : styles.row}
                  onClick={() => {
                    selectSortMode(mode)
                    close()
                  }}
                >
                  <span className={styles.rowIcon}>{sortModeIcons[mode]}</span>
                  <span>{t.sortModes[mode]}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
      <button
        type='button'
        className={isReversed ? `${styles.sortToggle} ${styles.reversed}` : styles.sortToggle}
        onClick={toggleSortDirection}
        aria-label={directionLabel}
        aria-pressed={isReversed}
        title={directionLabel}
      >
        <ArrowDownIcon />
      </button>
    </div>
  )
}
