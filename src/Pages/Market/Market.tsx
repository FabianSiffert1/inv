import React, { useContext, useEffect, useState } from 'react'
import { LoadingSpinner } from '../../Components/LoadingSpinner/LoadingSpinner'
import { HeaderContext } from '../../Header/HeaderProvider'
import { PokemonSetName, PokemonTCGSeries } from '../../util/api/pokemonTGC/model/PokemonSet'
import { useAllSets, useCardsOfSet } from '../../util/api/pokemonTGC/hooks'
import CardList from './CardList/CardList'
import CardListStatus from './CardListStatus'
import styles from './Market.module.scss'
import EraStrip from './Selector/EraStrip'
import selectorStyles from './Selector/Selector.module.scss'
import SetStrip from './Selector/SetStrip'

export default function Market() {
  const headerContext = useContext(HeaderContext)

  const [currentlySelectedPokemonSeries, setCurrentlySelectedPokemonSeries] = useState<PokemonTCGSeries | undefined>(undefined)
  const [currentlySelectedPokemonSet, setCurrentlySelectedPokemonSet] = useState<PokemonSetName | undefined>(undefined)
  const [isEraDropdownOpen, setEraDropdownOpen] = useState(true)
  const [isSetDropdownOpen, setSetDropdownOpen] = useState(false)

  const { data: sets, isFetching: areSetsFetching, error: setsError } = useAllSets()
  const { data: cards, isFetching: areCardsFetching, error: cardsError } = useCardsOfSet(currentlySelectedPokemonSet)

  const isFetching = areSetsFetching || areCardsFetching

  useEffect(() => {
    headerContext.setHeaderItem(isFetching ? <LoadingSpinner small /> : <></>)
  }, [isFetching])

  const selectEra = (series: PokemonTCGSeries) => {
    setCurrentlySelectedPokemonSeries(series)
    setCurrentlySelectedPokemonSet(undefined)
    setEraDropdownOpen(false)
    setSetDropdownOpen(true)
  }

  const selectSet = (set: PokemonSetName) => {
    scroll(0, 0)
    setCurrentlySelectedPokemonSet(set)
  }

  return (
    <div className={styles.market}>
      <div className={selectorStyles.selector}>
        <div className={selectorStyles.section}>
          <span className={selectorStyles.sectionLabel}>Era</span>
          <EraStrip
            pokemonSets={sets}
            currentlySelectedPokemonSeries={currentlySelectedPokemonSeries}
            setCurrentlySelectedPokemonSeries={selectEra}
            isOpen={isEraDropdownOpen}
            setOpen={(isOpen) => {
              setEraDropdownOpen(isOpen)
              if (isOpen) {
                setSetDropdownOpen(false)
              }
            }}
          />
        </div>
        <div className={selectorStyles.section}>
          <span className={selectorStyles.sectionLabel}>Set</span>
          <SetStrip
            pokemonSets={sets}
            currentlySelectedPokemonSeries={currentlySelectedPokemonSeries}
            currentlySelectedPokemonSet={currentlySelectedPokemonSet}
            setCurrentlySelectedPokemonSet={selectSet}
            isOpen={isSetDropdownOpen}
            setOpen={(isOpen) => {
              setSetDropdownOpen(isOpen)
              if (isOpen) {
                setEraDropdownOpen(false)
              }
            }}
          />
        </div>
      </div>

      <CardListStatus
        hasSelectedSet={currentlySelectedPokemonSet != undefined}
        isFetching={isFetching}
        error={cardsError ?? setsError}
        cardCount={cards?.length ?? 0}
      />

      <div className={styles.cardListWrapper}>
        <CardList cards={cards} />
      </div>
    </div>
  )
}
