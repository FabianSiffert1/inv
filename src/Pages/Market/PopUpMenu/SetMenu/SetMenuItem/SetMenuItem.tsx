import { PokemonSetLogo, PokemonSetName, PokemonSetSymbol } from '../../../../../util/api/pokemonTGC/model/PokemonSet'
import styles from './SetMenuItem.module.scss'

interface SetMenuItemProps {
  setName: PokemonSetName
  setSymbol: PokemonSetSymbol
  setLogo: PokemonSetLogo
  areCardsLoading: boolean
  currentlySelectedPokemonSet?: PokemonSetName
  toggleSetMenu: (setMenuOpen: boolean) => void
  setCurrentlySelectedPokemonSet: (set: PokemonSetName) => void
  setCurrentlySelectedPokemonSetLogoUrl: (logoUrl: PokemonSetLogo) => void
}

export default function SetMenuItem(props: SetMenuItemProps) {
  function selectSet(setName: PokemonSetName) {
    if (setName != undefined && setName != props.currentlySelectedPokemonSet) {
      scroll(0, 0)
      props.setCurrentlySelectedPokemonSet(setName)
    }
  }

  return (
    <div
      className={styles.setMenuItemContainer}
      onClick={
        !props.areCardsLoading
          ? () => {
              selectSet(props.setName)
              props.setCurrentlySelectedPokemonSetLogoUrl(props.setLogo)
              props.toggleSetMenu(false)
            }
          : undefined
      }
    >
      <div
        className={styles.setSymbol}
        onClick={() => {
          props.toggleSetMenu(false)
        }}
      >
        <img src={props.setLogo as unknown as string} alt={props.setName.toString()} />
        <div className={styles.setName}>
          <>{props.setName}</>
        </div>
      </div>
    </div>
  )
}
