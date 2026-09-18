import React, { useEffect, useRef } from 'react'
import styles from './Dropdown.module.scss'
import OptionGrid, { OptionGridItem } from './OptionGrid'

interface DropdownProps {
  options: OptionGridItem[]
  selectedId?: string
  onSelect: (id: string) => void
  ariaLabel: string
  variant: 'era' | 'set'
  placeholder: string
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  disabled?: boolean
  cachedIds?: string[]
}

export default function Dropdown(props: DropdownProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selectedOption = props.options.find((option) => option.id == props.selectedId)

  useEffect(() => {
    if (!props.isOpen) {
      return
    }

    const onPointerDown = (event: MouseEvent) => {
      if (wrapperRef.current != null && !wrapperRef.current.contains(event.target as Node)) {
        props.setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key == 'Escape') {
        props.setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [props.isOpen])

  return (
    <div className={styles.dropdown} ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        className={props.isOpen ? `${styles.trigger} ${styles.triggerOpen}` : styles.trigger}
        aria-expanded={props.isOpen}
        aria-haspopup="listbox"
        aria-label={props.ariaLabel}
        disabled={props.disabled}
        onClick={() => props.setOpen(!props.isOpen)}
      >
        {selectedOption?.imageUrl && <img className={styles.triggerImage} src={selectedOption.imageUrl} alt="" />}
        <span className={selectedOption ? styles.triggerLabel : `${styles.triggerLabel} ${styles.placeholder}`}>
          {selectedOption ? selectedOption.label : props.placeholder}
        </span>
        <svg className={styles.chevron} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {props.isOpen && !props.disabled && (
        <div className={styles.panel}>
          <OptionGrid
            variant={props.variant}
            ariaLabel={props.ariaLabel}
            options={props.options}
            cachedIds={props.cachedIds}
            selectedId={props.selectedId}
            onSelect={(id) => {
              props.onSelect(id)
              props.setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
