import { useCallback, useContext, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HeaderContext } from '../../Header/HeaderProvider'
import SearchToggle from '../../Header/SearchToggle/SearchToggle'
import { useArtistIndex, useCardsOfArtist } from '../../util/api/pokemonTGC/hooks'
import { Artist, artistPath } from '../../util/api/pokemonTGC/model/Artist'
import { PokemonCard } from '../../util/api/pokemonTGC/model/PokemonCard'
import { spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'
import { noBaseParams, useCardNavigation } from '../../util/ui/cards/useCardNavigation'
import { useVisibleCards } from '../../util/ui/cards/useVisibleCards'
import { SearchContext } from '../../util/ui/search/SearchProvider'
import { useIsMobile } from '../../util/ui/useIsMobile'
import CardList from '../Market/CardList/CardList'
import CardListStatus from '../Market/CardListStatus'
import styles from '../Pokemon/Pokemon.module.scss'
import ArtistGrid from './ArtistGrid'
import ArtistSelector from './ArtistSelector'
import { matchingArtists } from './artistSearch'

const artistsPath = '/artists'

export default function Artists() {
  const { setHeaderItem, setBusy } = useContext(HeaderContext)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { slug } = useParams()

  const { data: artists, isFetching: isIndexFetching, error: indexError } = useArtistIndex()
  const { data: cards, isFetching: areCardsFetching, error: cardsError } = useCardsOfArtist(slug)
  const isFetching = isIndexFetching || areCardsFetching

  const selectArtist = useCallback(
    (selectedSlug: string) => {
      window.scrollTo(0, 0)
      navigate(artistPath(selectedSlug))
    },
    [navigate]
  )

  useEffect(() => {
    setHeaderItem(<ArtistSelector artists={artists} selectedSlug={slug} onSelectArtist={selectArtist} />)
  }, [setHeaderItem, artists, slug, selectArtist])

  useEffect(() => {
    setBusy(isFetching)
  }, [setBusy, isFetching])

  useEffect(() => () => setBusy(false), [setBusy])

  return (
    <div className={styles.pokemonPage}>
      {slug == undefined ? (
        <ArtistOverview artists={artists} isFetching={isIndexFetching} error={indexError} />
      ) : (
        <ArtistCards
          artist={artists?.find((entry) => entry.slug == slug)}
          cards={cards}
          isFetching={isFetching}
          error={cardsError ?? indexError}
        />
      )}
      {isMobile && <SearchToggle floating />}
    </div>
  )
}

interface ArtistOverviewProps {
  artists?: Artist[]
  isFetching: boolean
  error: unknown
}

function ArtistOverview(props: ArtistOverviewProps) {
  const { query } = useContext(SearchContext)
  const artists = useMemo(() => props.artists ?? [], [props.artists])
  const visibleArtists = useMemo(() => matchingArtists(artists, query), [artists, query])

  if (props.error != null) {
    return (
      <CardListStatus
        hasSelectedEra
        hasSelectedSet
        isFetching={props.isFetching}
        error={props.error}
        cardCount={0}
        hasNoSearchMatches={false}
      />
    )
  }

  return (
    <>
      <div className={styles.pageTitle}>
        <h1 className={styles.pageHeadline}>Artists</h1>
        {artists.length > 0 && <span className={styles.pageCount}>{artists.length} artists</span>}
      </div>
      {artists.length > 0 && visibleArtists.length == 0 && (
        <div className={styles.status}>
          <div className={styles.headline}>No matching artists</div>
          <div className={styles.detail}>Try a different name.</div>
        </div>
      )}
      <div className={styles.listWrapper}>
        <ArtistGrid artists={visibleArtists} />
      </div>
    </>
  )
}

interface ArtistCardsProps {
  artist?: Artist
  cards?: PokemonCard[]
  isFetching: boolean
  error: unknown
}

function ArtistCards(props: ArtistCardsProps) {
  const { artist, cards } = props
  const visibleCards = useVisibleCards(cards)
  const { openCardId, openCard, stepToCard, closeCard } = useCardNavigation(noBaseParams)

  return (
    <>
      {artist && (
        <div className={styles.pageTitle}>
          {artist.pokemonNumber != undefined && (
            <img
              className={styles.sprite}
              src={spriteUrl(artist.pokemonNumber)}
              alt=''
              onError={(event) => (event.currentTarget.hidden = true)}
            />
          )}
          <h1 className={styles.pageHeadline}>{artist.name}</h1>
          <span className={styles.pageCount}>{artist.cardCount} cards</span>
          <span className={styles.pokedexNumber}>{artist.setCount} sets</span>
          <Link className={styles.generationLink} to={artistsPath} onClick={() => window.scrollTo(0, 0)}>
            <span aria-hidden='true'>←</span> All artists
          </Link>
        </div>
      )}
      <CardListStatus
        hasSelectedEra
        hasSelectedSet
        isFetching={props.isFetching}
        error={props.error}
        cardCount={cards?.length ?? 0}
        hasNoSearchMatches={(cards?.length ?? 0) > 0 && visibleCards?.length == 0}
      />
      <div className={styles.listWrapper}>
        <CardList cards={visibleCards} openCardId={openCardId} onOpenCard={openCard} onStepToCard={stepToCard} onCloseCard={closeCard} />
      </div>
    </>
  )
}
