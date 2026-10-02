import { useContext } from 'react'
import { PretzelIcon } from '../../../../../Header/LanguageToggle/LanguageIcons'
import { germanListingsUrl } from '../../../../../util/cardmarket'
import { LanguageContext } from '../../../../../util/ui/language/LanguageProvider'
import styles from './GermanListingsLink.module.scss'

interface GermanListingsLinkProps {
  cardmarketUrl?: string
}

export function GermanListingsLink({ cardmarketUrl }: GermanListingsLinkProps) {
  const { germanNames } = useContext(LanguageContext)
  if (!germanNames || cardmarketUrl == undefined) {
    return null
  }

  return (
    <a
      className={styles.germanListingsLink}
      href={germanListingsUrl(cardmarketUrl)}
      target='_blank'
      rel='noopener noreferrer'
      onClick={(event) => event.stopPropagation()}
      aria-label='German listings on Cardmarket'
      title='German listings on Cardmarket'
    >
      <PretzelIcon />
      <span className={styles.label}>DE</span>
      <span aria-hidden='true'>↗</span>
    </a>
  )
}
