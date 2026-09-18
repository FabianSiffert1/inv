import React, { useRef } from 'react'
import styles from './OptionGrid.module.scss'

export interface OptionGridItem {
  id: string
  label: string
  imageUrl?: string
}

interface OptionGridProps {
  options: OptionGridItem[]
  selectedId?: string
  onSelect: (id: string) => void
  ariaLabel: string
  variant: 'era' | 'set'
}

export default function OptionGrid(props: OptionGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key != 'ArrowLeft' && event.key != 'ArrowRight') {
      return
    }
    event.preventDefault()
    const nextIndex = index + (event.key == 'ArrowRight' ? 1 : -1)
    if (nextIndex < 0 || nextIndex >= props.options.length) {
      return
    }
    containerRef.current?.querySelectorAll('button')[nextIndex]?.focus()
  }

  return (
    <div
      className={props.variant == 'set' ? `${styles.grid} ${styles.setGrid}` : `${styles.grid} ${styles.eraGrid}`}
      ref={containerRef}
      role="tablist"
      aria-label={props.ariaLabel}
    >
      {props.options.map((option, index) => {
        const isSelected = option.id == props.selectedId
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={isSelected ? `${styles.item} ${styles.selected}` : styles.item}
            onClick={() => props.onSelect(option.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {option.imageUrl && <img className={styles.itemImage} src={option.imageUrl} alt="" loading="lazy" />}
            <span className={styles.itemLabel}>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
