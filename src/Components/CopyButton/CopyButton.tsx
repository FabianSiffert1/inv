import { useEffect, useRef, useState } from 'react'
import styles from './CopyButton.module.scss'

interface CopyButtonProps {
  value: string
  label: string
}

const copiedFeedbackMilliseconds = 1500

export function CopyButton(props: CopyButtonProps) {
  const [isCopied, setCopied] = useState(false)
  const feedbackTimeout = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(feedbackTimeout.current), [])

  const copy = async (event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(props.value)
    } catch {
      return
    }
    setCopied(true)
    window.clearTimeout(feedbackTimeout.current)
    feedbackTimeout.current = window.setTimeout(() => setCopied(false), copiedFeedbackMilliseconds)
  }

  return (
    <button type='button' className={styles.copyButton} aria-label={isCopied ? 'Copied' : props.label} title={props.label} onClick={copy}>
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </button>
  )
}

function CopyIcon() {
  return (
    <svg viewBox='0 0 16 16' aria-hidden='true' focusable='false'>
      <rect x='5.5' y='5.5' width='8' height='9' rx='1.5' fill='none' stroke='currentColor' strokeWidth='1.5' />
      <path
        d='M10.5 3V2.5A1 1 0 0 0 9.5 1.5H3A1.5 1.5 0 0 0 1.5 3v7.5a1 1 0 0 0 1 1H3'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox='0 0 16 16' aria-hidden='true' focusable='false'>
      <path d='M2.5 8.5l3.5 3.5 7.5-8' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}
