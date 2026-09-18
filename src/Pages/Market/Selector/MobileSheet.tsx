import { useRef } from 'react'
import { useModalBehaviour } from '../../../util/ui/useModalBehaviour'
import styles from './MobileSheet.module.scss'
import { OptionGridItem } from './OptionGrid'

interface MobileSheetProps {
  title: string
  options: OptionGridItem[]
  selectedId?: string
  onSelect: (id: string) => void
  onClose: () => void
  cachedIds?: string[]
}

export default function MobileSheet(props: MobileSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  useModalBehaviour(sheetRef, props.onClose)

  return (
    <div className={styles.sheetWrapper}>
      <div className={styles.overlay} onClick={props.onClose} />
      <div className={styles.sheet} ref={sheetRef} role='dialog' aria-modal='true' aria-label={props.title}>
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>{props.title}</span>
          <button type='button' className={styles.closeButton} aria-label='Close' onClick={props.onClose}>
            ×
          </button>
        </div>
        <ul className={styles.optionList} role='listbox' aria-label={props.title}>
          {props.options.map((option) => {
            const isSelected = option.id == props.selectedId
            return (
              <li key={option.id} role='option' aria-selected={isSelected}>
                <button
                  type='button'
                  className={isSelected ? `${styles.option} ${styles.optionSelected}` : styles.option}
                  onClick={() => props.onSelect(option.id)}
                >
                  {option.imageUrl && <img className={styles.optionImage} src={option.imageUrl} alt='' loading='lazy' />}
                  <span className={styles.optionLabel}>{option.label}</span>
                  {props.cachedIds?.includes(option.id) && <span className={styles.cachedDot} role='img' aria-label='Stored offline' />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
