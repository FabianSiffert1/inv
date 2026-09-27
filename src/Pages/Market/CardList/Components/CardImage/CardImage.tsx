import { useEffect, useRef, useState } from 'react'
import styles from './CardImage.module.scss'

interface CardImageProps {
  sources: (string | undefined)[]
  alt: string
  className?: string
  lazy?: boolean
}

type RetryState = 'initial' | 'waiting' | 'retrying'

const retryDelayMilliseconds = 3000
const failedSources = new Set<string>()

export function CardImage(props: CardImageProps) {
  const [retryState, setRetryState] = useState<RetryState>('initial')
  const [, setFailedSourceCount] = useState(0)
  const retryTimeout = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(retryTimeout.current), [])

  const source = props.sources.find((candidate): candidate is string => candidate != undefined && !failedSources.has(candidate))

  const handleError = () => {
    if (source == undefined) {
      return
    }
    if (retryState == 'initial') {
      setRetryState('waiting')
      retryTimeout.current = window.setTimeout(() => setRetryState('retrying'), retryDelayMilliseconds)
      return
    }
    failedSources.add(source)
    setRetryState('initial')
    setFailedSourceCount((previous) => previous + 1)
  }

  if (source == undefined || retryState == 'waiting') {
    return (
      <span className={styles.placeholder} role='img' aria-label={props.alt}>
        <span className={styles.placeholderName}>{props.alt}</span>
      </span>
    )
  }

  return (
    <img
      key={`${source}-${retryState}`}
      className={props.className}
      src={source}
      alt={props.alt}
      loading={props.lazy ? 'lazy' : undefined}
      decoding='async'
      onError={handleError}
    />
  )
}
