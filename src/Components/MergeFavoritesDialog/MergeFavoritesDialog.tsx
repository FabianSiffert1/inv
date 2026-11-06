import { useContext, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FavoritesContext } from '../../util/ui/favorites/FavoritesProvider'
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
  const noun = props.count == 1 ? 'favorite' : 'favorites'

  return createPortal(
    <div className={styles.wrapper}>
      <div className={styles.overlay} onClick={props.onDismiss} />
      <div className={styles.dialog} ref={containerRef} role='dialog' aria-modal='true' aria-labelledby='merge-favorites-title'>
        <div className={styles.titleRow}>
          <StarIcon />
          <h2 className={styles.headline} id='merge-favorites-title'>
            Move your favorites online?
          </h2>
        </div>
        <p className={styles.detail}>
          You have {props.count} {noun} saved on this device. Moving them to your account keeps them on every device you sign in on.
        </p>
        <p className={styles.detail}>
          Favorites already on your account stay as they are. This only adds. The copy on this device stays until the move has gone through.
        </p>
        <p className={styles.detail}>Heads up: this is new and comes without guarantees.</p>
        <div className={styles.actions}>
          <button type='button' className={styles.secondaryButton} onClick={props.onDismiss}>
            Not now
          </button>
          <button type='button' className={styles.primaryButton} onClick={props.onConfirm}>
            Move {props.count} {noun}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
