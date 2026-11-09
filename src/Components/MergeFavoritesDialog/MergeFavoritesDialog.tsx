import { useContext, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FavoritesContext } from '../../util/ui/favorites/FavoritesProvider'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import { useModalBehaviour } from '../../util/ui/useModalBehaviour'
import { StarIcon } from '../FavoriteButton/FavoriteButton'
import styles from './MergeFavoritesDialog.module.scss'

export default function MergeFavoritesDialog() {
  const { pendingMerge } = useContext(FavoritesContext)

  if (pendingMerge == undefined) {
    return null
  }

  return <MergeFavoritesPrompt count={pendingMerge.count} onConfirm={pendingMerge.confirm} onDismiss={pendingMerge.dismiss} />
}

interface MergeFavoritesPromptProps {
  count: number
  onConfirm: () => void
  onDismiss: () => void
}

function MergeFavoritesPrompt(props: MergeFavoritesPromptProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useModalBehaviour(containerRef, props.onDismiss)
  const t = useStrings()
  const noun = t.favoriteNoun(props.count)

  return createPortal(
    <div className={styles.wrapper}>
      <div className={styles.overlay} onClick={props.onDismiss} />
      <div className={styles.dialog} ref={containerRef} role='dialog' aria-modal='true' aria-labelledby='merge-favorites-title'>
        <div className={styles.titleRow}>
          <StarIcon />
          <h2 className={styles.headline} id='merge-favorites-title'>
            {t.mergeTitle}
          </h2>
        </div>
        <p className={styles.detail}>{t.mergeBody(props.count, noun)}</p>
        <p className={styles.detail}>{t.mergeAddsOnly}</p>
        <p className={styles.detail}>{t.mergeWarning}</p>
        <div className={styles.actions}>
          <button type='button' className={styles.secondaryButton} onClick={props.onDismiss}>
            {t.notNow}
          </button>
          <button type='button' className={styles.primaryButton} onClick={props.onConfirm}>
            {t.mergeConfirm(props.count, noun)}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
