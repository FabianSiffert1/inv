import React from 'react'
import styles from './ExternalLink.module.scss'

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  plain?: boolean
}

export function ExternalLink(props: ExternalLinkProps) {
  return (
    <a
      className={props.plain ? `${styles.externalLink} ${styles.plain}` : styles.externalLink}
      href={props.href}
      target='_blank'
      rel='noopener noreferrer'
      onClick={(event) => event.stopPropagation()}
    >
      <span className={styles.label}>{props.children}</span>
      {!props.plain && (
        <svg className={styles.icon} viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
          <path
            d='M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      )}
    </a>
  )
}
