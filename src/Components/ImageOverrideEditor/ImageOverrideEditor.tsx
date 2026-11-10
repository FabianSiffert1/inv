import { useQueryClient } from '@tanstack/react-query'
import { useContext, useEffect, useState } from 'react'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { AdminContext } from '../../util/admin/AdminProvider'
import { cardOverridesQueryKey, isValidImageUrl, useImageOverride } from '../../util/overrides/cardOverrides'
import { useStrings } from '../../util/ui/language/LanguageProvider'
import styles from './ImageOverrideEditor.module.scss'

type SaveState = 'idle' | 'saving' | 'failed'

export function ImageOverrideEditor({ card }: { card: PokemonCard }) {
  const { isAdmin } = useContext(AdminContext)
  if (!isAdmin) {
    return null
  }
  return <Editor card={card} />
}

function Editor({ card }: { card: PokemonCard }) {
  const t = useStrings()
  const queryClient = useQueryClient()
  const override = useImageOverride(card.id)
  const [url, setUrl] = useState(override ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')

  useEffect(() => setUrl(override ?? ''), [override])

  const run = (write: (module: typeof import('../../util/overrides/cloudOverrides')) => Promise<void>) => {
    setSaveState('saving')
    import('../../util/overrides/cloudOverrides').then(write).then(
      () => {
        setSaveState('idle')
        return queryClient.invalidateQueries({ queryKey: cardOverridesQueryKey })
      },
      () => setSaveState('failed')
    )
  }

  const trimmed = url.trim()
  const canSave = isValidImageUrl(trimmed) && trimmed != override && saveState != 'saving'

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>{t.imageOverride}</span>
      </div>
      <input
        className={styles.input}
        type='url'
        inputMode='url'
        placeholder='https://…'
        aria-label={t.imageOverrideUrl}
        value={url}
        onChange={(event) => setUrl(event.target.value)}
      />
      <div className={styles.actions}>
        <button
          type='button'
          className={styles.button}
          disabled={!canSave}
          onClick={() => run((module) => module.setImageOverride(card.id, trimmed))}
        >
          {t.save}
        </button>
        {override != undefined && (
          <button
            type='button'
            className={`${styles.button} ${styles.remove}`}
            disabled={saveState == 'saving'}
            onClick={() => run((module) => module.removeImageOverride(card.id))}
          >
            {t.remove}
          </button>
        )}
      </div>
      {saveState == 'failed' && <p className={styles.error}>{t.imageOverrideFailed}</p>}
    </section>
  )
}
