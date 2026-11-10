import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import styles from './LanguageBadge.module.scss'

const languageCodes: Record<NonNullable<PokemonCard['language']>, string> = {
  ja: 'JP'
}

export function LanguageBadge({ language }: { language: PokemonCard['language'] }) {
  const t = useStrings()
  if (language == undefined) {
    return null
  }
  return (
    <span className={styles.badge} title={t.cardLanguages[language]} aria-label={t.cardLanguages[language]}>
      {languageCodes[language]}
    </span>
  )
}
