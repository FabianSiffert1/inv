import React, { ReactElement } from 'react'
import {
    PokemonSet,
    PokemonSetLogo,
    PokemonSetName,
    PokemonTCGSeries
} from '../../../../util/api/pokemonTGC/model/PokemonSet'
import { useSetsOfSeries } from '../../../../util/api/pokemonTGC/hooks'
import styles from './SetMenu.module.scss'
import SetMenuItem from './SetMenuItem/SetMenuItem'

interface SetMenuProps {
    currentlySelectedPokemonSeries: PokemonTCGSeries
    areCardsLoading: boolean
    toggleSetMenu: (setOpen: boolean) => void
    setMenuIsOpen: boolean
    currentlySelectedPokemonSet?: PokemonSetName
    setCurrentlySelectedPokemonSet: (set: PokemonSetName) => void
    currentlySelectedPokemonSetLogoUrl?: PokemonSetLogo
    setCurrentlySelectedPokemonSetImageUrl: (logoUrl: PokemonSetLogo) => void
}

export default function SetMenu(props: SetMenuProps) {
    const { data: allSetsFromASeries } = useSetsOfSeries(props.currentlySelectedPokemonSeries)

    const setArray: ReactElement<PokemonSet>[] = []
    if (allSetsFromASeries != null) {
        allSetsFromASeries.forEach((set) => {
            setArray.push(
                <SetMenuItem
                    key={set.name}
                    setName={set.name}
                    setSymbol={set.images.symbol}
                    setLogo={set.images.logo}
                    areCardsLoading={props.areCardsLoading}
                    toggleSetMenu={props.toggleSetMenu}
                    currentlySelectedPokemonSet={props.currentlySelectedPokemonSet}
                    setCurrentlySelectedPokemonSet={props.setCurrentlySelectedPokemonSet}
                    setCurrentlySelectedPokemonSetLogoUrl={props.setCurrentlySelectedPokemonSetImageUrl}
                />
            )
        })
    }

    return (
        <div className={styles.setMenuWrapper}>
            {props.currentlySelectedPokemonSet ? (
                <div className={styles.setLogo}>
                    <img
                        onClick={() => props.toggleSetMenu(true)}
                        src={props.currentlySelectedPokemonSetLogoUrl as unknown as string}
                        alt={props.currentlySelectedPokemonSet as unknown as string}
                    />
                </div>
            ) : undefined}
            {props.setMenuIsOpen ? (
                <div className={styles.setPopUpMenuContainer}>
                    <div className={styles.overlay} onClick={() => props.toggleSetMenu(false)}/>
                    <div className={styles.setPopUpMenuWrapper}>
                        <div className={styles.setPopUpMenu}>{setArray}</div>
                        <div className={styles.hideSetMenuButton} onClick={() => props.toggleSetMenu(false)}>
                            Close
                        </div>
                    </div>
                </div>
            ) : undefined}
        </div>
    )
}
