import { Fragment, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Pokemon, pokemonPath, spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import { LanguageContext, localizedName, useStrings } from '../../util/ui/language/LanguageProvider'
import styles from './EvolutionChain.module.scss'

interface EvolutionChainProps {
  pokemon: Pokemon
  pokemonIndex: Pokemon[]
}

const evolutionStages = (pokemon: Pokemon, pokemonIndex: Pokemon[]): Pokemon[][] => {
  const byNumber = new Map(pokemonIndex.map((entry) => [entry.number, entry]))
  const visited = new Set<number>([pokemon.number])
  const parentOf = (entry: Pokemon) => (entry.evolvesFrom == undefined ? undefined : byNumber.get(entry.evolvesFrom))
  let root = pokemon
  let parent = parentOf(root)
  while (parent && !visited.has(parent.number)) {
    visited.add(parent.number)
    root = parent
    parent = parentOf(root)
  }

  const stages: Pokemon[][] = []
  const seen = new Set<number>([root.number])
  for (let stage = [root]; stage.length > 0;) {
    stages.push(stage)
    const numbers = new Set(stage.map((entry) => entry.number))
    stage = pokemonIndex.filter((entry) => entry.evolvesFrom != undefined && numbers.has(entry.evolvesFrom) && !seen.has(entry.number))
    stage.forEach((entry) => seen.add(entry.number))
  }
  return stages
}

export default function EvolutionChain(props: EvolutionChainProps) {
  const { germanNames } = useContext(LanguageContext)
  const t = useStrings()
  const stages = useMemo(() => evolutionStages(props.pokemon, props.pokemonIndex), [props.pokemon, props.pokemonIndex])

  if (stages.length < 2) {
    return null
  }

  return (
    <nav className={styles.chain} aria-label={t.evolutionChain}>
      {stages.map((stage, index) => (
        <Fragment key={stage[0].number}>
          {index > 0 && (
            <span className={styles.arrow} aria-hidden='true'>
              →
            </span>
          )}
          <div className={styles.stage}>
            {stage.map((entry) => {
              const content = (
                <>
                  <img
                    className={styles.sprite}
                    src={spriteUrl(entry.number)}
                    alt=''
                    onError={(event) => (event.currentTarget.hidden = true)}
                  />
                  <span className={styles.name}>{localizedName(entry, germanNames)}</span>
                </>
              )
              return entry.number == props.pokemon.number ? (
                <span key={entry.number} className={`${styles.member} ${styles.current}`} aria-current='page'>
                  {content}
                </span>
              ) : (
                <Link key={entry.number} className={styles.member} to={pokemonPath(entry.number)} onClick={() => window.scrollTo(0, 0)}>
                  {content}
                </Link>
              )
            })}
          </div>
        </Fragment>
      ))}
    </nav>
  )
}
