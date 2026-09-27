import { useEffect, useRef, useState } from 'react'
import styles from './CardImage.module.scss'

interface CardImageProps {
  sources: (string | undefined)[]
  alt: string
  className?: string
  lazy?: boolean
}

const retryDelayMilliseconds = 3000

export function CardImage(props: CardImageProps) {
  const sources = props.sources.filter((source): source is string => source != undefined)
  const [sourceIndex, setSourceIndex] = useState(0)
  const [hasRetried, setRetried] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const retryTimeout = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(retryTimeout.current), [])

  const handleError = () => {
    if (!hasRetried) {
      setRetried(true)
      retryTimeout.current = window.setTimeout(() => setAttempt((previous) => previous + 1), retryDelayMilliseconds)
      return
    }
    setRetried(false)
    setSourceIndex((previous) => previous + 1)
  }

  const source = sources[sourceIndex]
  if (source == undefined) {
    return (
      <span className={styles.placeholder} role='img' aria-label={props.alt}>
        <span className={styles.placeholderName}>{props.alt}</span>
      </span>
    )
  }

  return (
    <img
      key={`${source}-${attempt}`}
      className={props.className}
      src={source}
      alt={props.alt}
      loading={props.lazy ? 'lazy' : undefined}
      decoding='async'
      onError={handleError}
    />
  )
}
