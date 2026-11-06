import { ReactElement, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { nextSortMode, SortContext, SortMode, sortModes } from '../../util/ui/sort/SortProvider'
import { CalendarIcon, CoinIcon, GemIcon, HashIcon, PikaTextIcon } from './SortIcons'
import styles from './SortToggle.module.scss'

const sortModeIcons: Record<SortMode, ReactElement> = {
  price: <CoinIcon />,
  number: <HashIcon />,
  name: <PikaTextIcon />,
  rarity: <GemIcon />,
  release: <CalendarIcon />
}

const sortModeLabels: Record<SortMode, string> = {
  price: 'price',
  number: 'card number',
  name: 'name',
  rarity: 'rarity',
  release: 'release date'
}

const isSingleSetPath = (pathname: string): boolean => pathname == '/' || pathname.startsWith('/market')

export default function SortToggle() {
  const { sortMode, cycleSortMode } = useContext(SortContext)
  const location = useLocation()
  const availableModes = isSingleSetPath(location.pathname) ? sortModes.filter((mode) => mode != 'release') : sortModes
  const label = `Sorted by ${sortModeLabels[sortMode]}, sort by ${sortModeLabels[nextSortMode(sortMode, availableModes)]}`

  return (
    <button type='button' className={styles.sortToggle} onClick={() => cycleSortMode(availableModes)} aria-label={label} title={label}>
      {sortModeIcons[sortMode]}
    </button>
  )
}
