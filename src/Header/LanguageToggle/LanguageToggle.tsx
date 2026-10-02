import { useContext } from 'react'
import { LanguageContext } from '../../util/ui/language/LanguageProvider'
import { PretzelIcon, TeacupIcon } from './LanguageIcons'
import styles from './LanguageToggle.module.scss'

export default function LanguageToggle() {
  const languageContext = useContext(LanguageContext)
  const switchesToEnglish = languageContext.germanNames
  const label = switchesToEnglish ? 'Show English card names' : 'Show German card names'

  return (
    <button type='button' className={styles.languageToggle} onClick={languageContext.toggleLanguage} aria-label={label} title={label}>
      {switchesToEnglish ? <TeacupIcon /> : <PretzelIcon />}
    </button>
  )
}
