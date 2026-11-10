import React, { useRef } from 'react'
import { useStrings } from '../../../util/ui/language/LanguageProvider'
import styles from './OptionGrid.module.scss'

export interface OptionGridItem {
  id: string
  label: string
  detail?: string
  tint?: string
  imageUrl?: string
}

interface OptionGridProps {
  options: OptionGridItem[]
  selectedId?: string
  onSelect: (id: string) => void
  ariaLabel: string
  variant: 'era' | 'set'
  cachedIds?: string[]
}

const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']

export default function OptionGrid(props: OptionGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useStrings()

  const focusOptionAt = (index: number) => {
    containerRef.current?.querySelectorAll('button')[index]?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!navigationKeys.includes(event.key)) {
      return
    }
    event.preventDefault()

    if (event.key == 'Home') {
      focusOptionAt(0)
      return
    }
    if (event.key == 'End') {
      focusOptionAt(props.options.length - 1)
      return
    }

    const step = event.key == 'ArrowRight' || event.key == 'ArrowDown' ? 1 : -1
    const nextIndex = index + step
    if (nextIndex < 0 || nextIndex >= props.options.length) {
      return
    }
    focusOptionAt(nextIndex)
  }

  return (
    <div
      className={props.variant == 'set' ? `${styles.grid} ${styles.setGrid}` : `${styles.grid} ${styles.eraGrid}`}
      ref={containerRef}
      role='listbox'
      aria-label={props.ariaLabel}
    >
      {props.options.map((option, index) => {
        const isSelected = option.id == props.selectedId
        return (
          <button
            key={option.id}
            type='button'
            role='option'
            aria-selected={isSelected}
            className={isSelected ? `${styles.item} ${styles.selected}` : styles.item}
            style={option.tint ? ({ '--tint': option.tint } as React.CSSProperties) : undefined}
            onClick={() => props.onSelect(option.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {option.imageUrl && (
              <img
                className={styles.itemImage}
                src={option.imageUrl}
                alt=''
                loading='lazy'
                onError={(event) => (event.currentTarget.hidden = true)}
              />
            )}
            <span className={styles.itemText}>
              <span className={styles.itemLabel}>{option.label}</span>
              {option.detail && <span className={styles.itemDetail}>{option.detail}</span>}
            </span>
            {props.cachedIds?.includes(option.id) && <span className={styles.cachedDot} role='img' aria-label={t.storedOffline} />}
          </button>
        )
      })}
    </div>
  )
}
