import { ReactElement, useContext } from 'react'
import { nextSortMode, SortContext, SortMode } from '../../util/ui/sort/SortProvider'
import { CoinIcon, HashIcon, PikaTextIcon } from './SortIcons'
import styles from './SortToggle.module.scss'

const sortModeIcons: Record<SortMode, ReactElement> = {
  price: <CoinIcon />,
  number: <HashIcon />,
  name: <PikaTextIcon />
}

const sortModeLabels: Record<SortMode, string> = {
  price: 'price',
  number: 'card number',
  name: 'name'
}

export default function SortToggle() {
  const { sortMode, cycleSortMode } = useContext(SortContext)
  const label = `Sorted by ${sortModeLabels[sortMode]}, sort by ${sortModeLabels[nextSortMode(sortMode)]}`

  return (
    <button type='button' className={styles.sortToggle} onClick={cycleSortMode} aria-label={label} title={label}>
      {sortModeIcons[sortMode]}
    </button>
  )
}
