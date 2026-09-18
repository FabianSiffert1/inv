import React, {ReactElement, useState} from 'react'
import {PokemonSet, PokemonTCGSeries} from '../../../../util/api/pokemonTGC/model/PokemonSet'
import styles from './SeriesMenu.module.scss'
import {SeriesMenuItem} from './SeriesMenuItem/SeriesMenuItem'

interface SetMenuProps {
    pokemonSets?: PokemonSet[]
    setCurrentlySelectedPokemonSeries: (currentlySelectSeries: PokemonTCGSeries) => void
    currentlySelectedPokemonSeries: PokemonTCGSeries
    toggleSetMenu: (setOpen: boolean) => void
}

export default function SeriesMenu(props: SetMenuProps) {
    const [seriesMenuIsOpen, toggleSeriesMenu] = useState(false)
    const toggleOpen = () => {
        toggleSeriesMenu(!seriesMenuIsOpen)
    }

    const seriesArray: ReactElement<PokemonTCGSeries>[] = []
    const uniqueSeries: Set<PokemonTCGSeries> = new Set()
    if (props.pokemonSets != null) {
        props.pokemonSets.forEach((pokemonSet) => {
            return uniqueSeries.add(pokemonSet.series)
        })
    }

    let id = 0
    const currentlySelectedPokemonSeries = props.currentlySelectedPokemonSeries as unknown as ReactElement

    uniqueSeries.forEach((series) => {
        seriesArray.push(
            <SeriesMenuItem
                seriesName={series}
                key={id}
                toggleSetMenu={props.toggleSetMenu}
                setCurrentlySelectedPokemonSeries={props.setCurrentlySelectedPokemonSeries}
            />
        )
        id++
    })
    return (
        <div className={styles.seriesMenuWrapper}>
            <div className={styles.seriesMenuContainer}>
                <div className={styles.seriesNameContainer}>
                    <div className={styles.seriesName} onClick={toggleOpen}>
                        {currentlySelectedPokemonSeries}
                    </div>
                </div>
                {seriesMenuIsOpen && (
                    <div className={styles.seriesPopUpMenuContainer}>
                        <div className={styles.overlay} onClick={toggleOpen}/>
                        <div className={styles.seriesPopUpMenu} onClick={toggleOpen}>
                            {seriesArray}
                        </div>
                        <div className={styles.hideSeriesMenuButton} onClick={() => toggleSeriesMenu(false)}>
                            Close
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
