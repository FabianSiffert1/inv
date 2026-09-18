import React, { useEffect, useRef } from 'react'
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
  const onCloseRef = useRef(props.onClose)
  onCloseRef.current = props.onClose

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key == 'Escape') {
        onCloseRef.current()
      }
    }
    const previousOverflow = document.body.style.overflow
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div className={styles.sheetWrapper} role="dialog" aria-modal="true" aria-label={props.title}>
      <div className={styles.overlay} onClick={props.onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>{props.title}</span>
          <button type="button" className={styles.closeButton} aria-label="Close" onClick={props.onClose}>
            ×
          </button>
        </div>
        <ul className={styles.optionList}>
          {props.options.map((option) => {
            const isSelected = option.id == props.selectedId
            return (
              <li key={option.id}>
                <button
                  type="button"
                  aria-current={isSelected}
                  className={isSelected ? `${styles.option} ${styles.optionSelected}` : styles.option}
                  onClick={() => props.onSelect(option.id)}
                >
                  {option.imageUrl && <img className={styles.optionImage} src={option.imageUrl} alt="" loading="lazy" />}
                  <span className={styles.optionLabel}>{option.label}</span>
                  {props.cachedIds?.includes(option.id) && <span className={styles.cachedDot} title="Stored offline" />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
