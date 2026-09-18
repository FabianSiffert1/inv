import { RefObject, useEffect, useRef } from 'react'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

export const useModalBehaviour = (containerRef: RefObject<HTMLElement>, onClose: () => void) => {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow

    const focusableElements = () => Array.from(containerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key == 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key != 'Tab') {
        return
      }
      const elements = focusableElements()
      if (elements.length == 0) {
        event.preventDefault()
        return
      }
      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement
      if (!event.shiftKey && active == last) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && active == first) {
        event.preventDefault()
        last.focus()
      } else if (active == null || !containerRef.current?.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    focusableElements()[0]?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [containerRef])
}
