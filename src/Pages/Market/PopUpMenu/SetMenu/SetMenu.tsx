import React, {ReactElement, useEffect, useState} from 'react'
import {PokemonCard} from '../../../../util/api/pokemonTGC/model/PokemonCard'
import {
    PokemonSet,
    PokemonSetLogo,
    PokemonSetName,
    PokemonTCGSeries
} from '../../../../util/api/pokemonTGC/model/PokemonSet'
import {fetchAllSetsOfASeries} from '../../../../util/api/pokemonTGC/querys'
import styles from './SetMenu.module.scss'
import SetMenuItem from './SetMenuItem/SetMenuItem'

interface SetMenuProps {
    currentlySelectedPokemonSeries: PokemonTCGSeries
    areCardsLoading: boolean
    setCardsLoading: (areCardsLoading: boolean) => void
    toggleSetMenu: (setOpen: boolean) => void
    setMenuIsOpen: boolean
    setCardList: (newCardList: PokemonCard[]) => void
    currentlySelectedPokemonSet?: PokemonSetName
    setCurrentlySelectedPokemonSet: (set: PokemonSetName) => void
    currentlySelectedPokemonSetLogoUrl?: PokemonSetLogo
    setCurrentlySelectedPokemonSetImageUrl: (logoUrl: PokemonSetLogo) => void
}

export default function SetMenu(props: SetMenuProps) {
    const [allSetsFromASeries, setAllSetsFromASeries] = useState<PokemonSet[]>([])

    useEffect(() => {
        props.setCardsLoading(true)
        setAllSetsFromASeries([])
        const getSetData = async () => {
            try {
                const result = await fetchAllSetsOfASeries(props.currentlySelectedPokemonSeries)
                setAllSetsFromASeries(result)
                props.setCardsLoading(false)
            } catch (error) {
                console.error('Error in Market - getSetData useEffect:', error)
            }
        }

        getSetData().then(() => props.setCardsLoading(false))
    }, [props.currentlySelectedPokemonSeries])

    const setArray: ReactElement<PokemonSet>[] = []
    if (allSetsFromASeries != null) {
        allSetsFromASeries.forEach((set) => {
            setArray.push(
                <SetMenuItem
                    key={set.name}
                    setName={set.name}
                    setSymbol={set.images.symbol}
                    setLogo={set.images.logo}
                    setContentOfCardList={props.setCardList}
                    setCardsLoading={props.setCardsLoading}
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
