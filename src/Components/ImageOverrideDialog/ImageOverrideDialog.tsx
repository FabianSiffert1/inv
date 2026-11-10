import { useQueryClient } from '@tanstack/react-query'
import { FormEvent, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { AdminContext } from '../../util/admin/AdminProvider'
import {
  cardOverridesQueryKey,
  isValidImageUrl,
  useImageOverride,
  useOriginalImageAvailable,
  useRemoteImageOverride
} from '../../util/overrides/cardOverrides'
import { useLocalizedName, useStrings } from '../../util/ui/language/LanguageProvider'
import { useModalBehaviour } from '../../util/ui/useModalBehaviour'
import styles from './ImageOverrideDialog.module.scss'

type CloudOverrides = typeof import('../../util/overrides/cloudOverrides')

export function AdminCardActions({ card, className }: { card: PokemonCard; className?: string }) {
  const { isAdmin } = useContext(AdminContext)
  if (!isAdmin) {
    return null
  }
  return <AdminActions card={card} className={className} />
}

function AdminActions({ card, className }: { card: PokemonCard; className?: string }) {
  const t = useStrings()
  const [isOpen, setOpen] = useState(false)
  const isOriginalAvailable = useOriginalImageAvailable(card.id)

  return (
    <div className={className}>
      {isOriginalAvailable && (
        <span className={styles.apiBadge} title={t.originalImageAvailableHint}>
          {t.originalImageAvailable}
        </span>
      )}
      <button type='button' className={styles.editChip} title={t.editCard} onClick={() => setOpen(true)}>
        {t.edit}
      </button>
      {isOpen && <ImageOverrideDialog card={card} onClose={() => setOpen(false)} />}
    </div>
  )
}

type SaveState = 'idle' | 'saving' | 'failed'

function ImageOverrideDialog({ card, onClose }: { card: PokemonCard; onClose: () => void }) {
  const containerRef = useRef<HTMLFormElement>(null)
  useModalBehaviour(containerRef, onClose)
  const t = useStrings()
  const cardName = useLocalizedName(card)
  const queryClient = useQueryClient()
  const override = useRemoteImageOverride(card.id)
  const shownOverride = useImageOverride(card.id)
  const isOriginalAvailable = useOriginalImageAvailable(card.id)
  const [url, setUrl] = useState(override ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [failedPreview, setFailedPreview] = useState<string | undefined>(undefined)

  const trimmed = url.trim()
  const isValid = isValidImageUrl(trimmed)
  const preview = isValid && trimmed != override ? trimmed : (shownOverride ?? card.images.small)
  const canSave = isValid && trimmed != override && saveState != 'saving'

  const write = (action: (module: CloudOverrides) => Promise<void>) => {
    setSaveState('saving')
    import('../../util/overrides/cloudOverrides')
      .then(action)
      .then(() => queryClient.invalidateQueries({ queryKey: cardOverridesQueryKey }))
      .then(onClose, () => setSaveState('failed'))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (canSave) {
      write((module) => module.setImageOverride(card.id, trimmed))
    }
  }

  return createPortal(
    <div className={styles.wrapper}>
      <div className={styles.overlay} onClick={onClose} />
      <form
        className={styles.dialog}
        ref={containerRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='image-override-title'
        onSubmit={submit}
      >
        <div>
          <h2 className={styles.headline} id='image-override-title'>
            {t.imageOverride}
          </h2>
          <p className={styles.subtitle}>
            {cardName} · {card.set.name} #{card.number}
          </p>
        </div>
        <div className={styles.preview}>
          {preview != undefined && failedPreview != preview ? (
            <img src={preview} alt='' onError={() => setFailedPreview(preview)} />
          ) : (
            <span className={styles.previewMissing}>{t.imageOverridePreviewFailed}</span>
          )}
        </div>
        <label className={styles.field}>
          <span className={styles.label}>{t.imageOverrideUrl}</span>
          <input
            className={styles.input}
            type='url'
            inputMode='url'
            placeholder='https://…'
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            autoFocus
          />
        </label>
        <p className={styles.hint}>{t.imageOverrideHint}</p>
        {isOriginalAvailable && <p className={styles.notice}>{t.originalImageAvailableHint}</p>}
        {saveState == 'failed' && (
          <p className={styles.error} role='alert'>
            {t.imageOverrideFailed}
          </p>
        )}
        <div className={styles.actions}>
          {override != undefined && (
            <button
              type='button'
              className={styles.removeButton}
              disabled={saveState == 'saving'}
              onClick={() => write((module) => module.removeImageOverride(card.id))}
            >
              {t.remove}
            </button>
          )}
          <button type='button' className={styles.secondaryButton} onClick={onClose}>
            {t.cancel}
          </button>
          <button type='submit' className={styles.primaryButton} disabled={!canSave}>
            {t.save}
          </button>
        </div>
      </form>
    </div>,
    document.body
  )
}
