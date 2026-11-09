import { ReactElement, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import { nextSortMode, SortContext, SortMode, sortModes } from '../../util/ui/sort/SortProvider'
import { ArrowDownIcon, CalendarIcon, CoinIcon, GemIcon, HashIcon, PikaTextIcon } from './SortIcons'
import styles from './SortToggle.module.scss'

const sortModeIcons: Record<SortMode, ReactElement> = {
  price: <CoinIcon />,
  number: <HashIcon />,
  name: <PikaTextIcon />,
  rarity: <GemIcon />,
  release: <CalendarIcon />
}

const isSingleSetPath = (pathname: string): boolean => pathname == '/' || pathname.startsWith('/market')

export default function SortToggle() {
  const { sortMode, isReversed, cycleSortMode, toggleSortDirection } = useContext(SortContext)
  const location = useLocation()
  const availableModes = isSingleSetPath(location.pathname) ? sortModes.filter((mode) => mode != 'release') : sortModes
  const t = useStrings()
  const label = t.sortLabel(t.sortModes[sortMode], t.sortModes[nextSortMode(sortMode, availableModes)])
  const [defaultOrder, reversedOrder] = t.sortOrders[sortMode]
  const directionLabel = isReversed ? t.sortDirectionLabel(reversedOrder, defaultOrder) : t.sortDirectionLabel(defaultOrder, reversedOrder)

  return (
    <div className={styles.sortControls}>
      <button type='button' className={styles.sortToggle} onClick={() => cycleSortMode(availableModes)} aria-label={label} title={label}>
        {sortModeIcons[sortMode]}
      </button>
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
