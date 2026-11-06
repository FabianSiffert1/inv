import React from 'react'
import styles from './ExternalLink.module.scss'

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  plain?: boolean
  className?: string
}

export function ExternalLink(props: ExternalLinkProps) {
  const classNames = [styles.externalLink, props.plain ? styles.plain : undefined, props.className].filter(Boolean).join(' ')

  return (
    <a className={classNames} href={props.href} target='_blank' rel='noopener noreferrer' onClick={(event) => event.stopPropagation()}>
      {props.children}
    </a>
  )
}
