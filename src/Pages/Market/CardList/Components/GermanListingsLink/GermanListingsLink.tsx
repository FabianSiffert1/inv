import { useContext } from 'react'
import { PretzelIcon } from '../../../../../Header/LanguageToggle/LanguageIcons'
import { germanListingsUrl } from '../../../../../util/cardmarket'
import { LanguageContext, useStrings } from '../../../../../util/ui/language/LanguageProvider'
import styles from './GermanListingsLink.module.scss'

interface GermanListingsLinkProps {
  cardmarketUrl?: string
}

export function GermanListingsLink({ cardmarketUrl }: GermanListingsLinkProps) {
  const { germanNames } = useContext(LanguageContext)
  const t = useStrings()
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
      aria-label={t.germanListings}
      title={t.germanListings}
    >
      <PretzelIcon />
      <span className={styles.label}>DE</span>
    </a>
  )
}
