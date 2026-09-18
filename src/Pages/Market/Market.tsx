import React, { useContext, useEffect, useState } from 'react'
import { LoadingSpinner } from '../../Components/LoadingSpinner/LoadingSpinner'
import { HeaderContext } from '../../Header/HeaderProvider'
import { PokemonSetLogo, PokemonSetName, PokemonTCGSeries } from '../../util/api/pokemonTGC/model/PokemonSet'
import { useAllSets, useCardsOfSet, useSpecies } from '../../util/api/pokemonTGC/hooks'
import CardList from './CardList/CardList'
import styles from './Market.module.scss'
import SeriesMenu from './PopUpMenu/SeriesMenu/SeriesMenu'
import SetMenu from './PopUpMenu/SetMenu/SetMenu'

export default function Market() {
  const headerContext = useContext(HeaderContext)

  const [setMenuIsOpen, toggleSetMenuOpen] = useState(false)

  const baseSeries: PokemonTCGSeries = 'Base' as unknown as PokemonTCGSeries
  const [currentlySelectedPokemonSeries, setCurrentlySelectedPokemonSeries] = useState<PokemonTCGSeries>(baseSeries)
  const [currentlySelectedPokemonSet, setCurrentlySelectedPokemonSet] = useState<PokemonSetName | undefined>(undefined)
  const [currentlySelectedPokemonSetLogoUrl, setCurrentlySelectedPokemonSetLogoUrl] = useState<PokemonSetLogo | undefined>(undefined)

  const { data: sets } = useAllSets()
  const { data: defaultCards, isFetching: areDefaultCardsFetching } = useSpecies('Charizard', 'base')
  const { data: cardsOfSet, isFetching: areCardsOfSetFetching } = useCardsOfSet(currentlySelectedPokemonSet)

  const cards = currentlySelectedPokemonSet ? cardsOfSet : defaultCards
  const areCardsLoading = currentlySelectedPokemonSet ? areCardsOfSetFetching : areDefaultCardsFetching

  const toggleSetMenu = (setOpen: boolean) => {
    toggleSetMenuOpen(setOpen)
  }

  useEffect(() => {
    headerContext.setHeaderItem(
      <div className={styles.header}>
        {areCardsLoading && (
          <div className={styles.loadingState}>
            <LoadingSpinner />
          </div>
        )}
        <SeriesMenu
          pokemonSets={sets}
          toggleSetMenu={toggleSetMenu}
          currentlySelectedPokemonSeries={currentlySelectedPokemonSeries}
          setCurrentlySelectedPokemonSeries={setCurrentlySelectedPokemonSeries}
        />
        <SetMenu
          areCardsLoading={areCardsLoading}
          currentlySelectedPokemonSeries={currentlySelectedPokemonSeries}
          currentlySelectedPokemonSet={currentlySelectedPokemonSet}
          setCurrentlySelectedPokemonSet={setCurrentlySelectedPokemonSet}
          currentlySelectedPokemonSetLogoUrl={currentlySelectedPokemonSetLogoUrl}
          setCurrentlySelectedPokemonSetImageUrl={setCurrentlySelectedPokemonSetLogoUrl}
          toggleSetMenu={toggleSetMenu}
          setMenuIsOpen={setMenuIsOpen}
        />
      </div>
    )
  }, [
    sets,
    currentlySelectedPokemonSeries,
    areCardsLoading,
    currentlySelectedPokemonSet,
    currentlySelectedPokemonSetLogoUrl,
    setMenuIsOpen
  ])

  return (
    <div className={styles.market}>
      <div className={styles.cardListWrapper}>
        <CardList cards={cards} />
      </div>
    </div>
  )
}
