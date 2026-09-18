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
    </a>
  )
}
