import { FavoriteButton } from '../../../../../Components/FavoriteButton/FavoriteButton'
import { PokemonCardProp } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { cardPriceRows, PriceCell } from '../../../../../util/cardPrice'
import { Currency, formatPrice } from '../../../../../util/format/price'
import { formatPriceDate } from '../../../../../util/format/date'
import { useStrings } from '../../../../../util/ui/language/LanguageProvider'
import { cardmarketSearchLink, priceChartingSearchLink, tcgplayerSearchLink } from '../../../../../util/shareLinks'
import { ExternalLink } from '../ExternalLink/ExternalLink'
import { GermanListingsLink } from '../GermanListingsLink/GermanListingsLink'
import styles from './CardPrices.module.scss'

function PriceUpdatedAt({ updatedAt }: { updatedAt?: string }) {
  const t = useStrings()
  const formatted = formatPriceDate(updatedAt, t.locale)
  if (formatted == undefined) {
    return null
  }
  return (
    <div className={styles.priceUpdated}>
      {t.pricesFrom} <span className={styles.priceDate}>{formatted}</span>
    </div>
  )
}

function PriceCellContent({ cell, currency, emphasized }: { cell?: PriceCell; currency: Currency; emphasized: boolean }) {
  const t = useStrings()
  if (cell == undefined) {
    return <span className={styles.priceMissing}>–</span>
  }
  const amount = formatPrice(cell.amount, currency)
  const highest = formatPrice(cell.highestAmount, currency)
  const text = amount != undefined && highest != undefined && highest != amount ? t.range(amount, highest) : amount
  const className = emphasized ? `${styles.priceAmount} ${styles.priceAmountMain}` : styles.priceAmount
  return cell.url ? (
    <ExternalLink href={cell.url} className={`${className} ${styles.priceLink}`} plain>
      {text}
    </ExternalLink>
  ) : (
    <span className={className}>{text}</span>
  )
}

export function CardPrices(props: PokemonCardProp) {
  const rows = cardPriceRows(props.card)
  const cardmarketUrl = props.card.cardmarket?.url
  const t = useStrings()

  return (
    <section className={styles.panel}>
      {rows.length == 0 ? (
        <div className={styles.emptyPanel}>{t.noPrices}</div>
      ) : (
        <table className={styles.priceTable}>
          <thead>
            <tr>
              <th scope='col' />
              <th scope='col'>
                <span className={styles.priceColumn}>
                  <span className={styles.priceColumnLabel}>Cardmarket</span>
                  <GermanListingsLink cardmarketUrl={cardmarketUrl} />
                </span>
              </th>
              <th scope='col'>
                <span className={styles.priceColumnLabel}>TCGplayer</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope='row' className={styles.priceRowLabel}>
                  <FavoriteButton card={props.card} print={row.isMain ? undefined : row.label} small />
                  {row.label}
                </th>
                <td>
                  <PriceCellContent cell={row.cardmarket} currency='EUR' emphasized={row.isMain} />
                </td>
                <td>
                  <PriceCellContent cell={row.tcgplayer} currency='USD' emphasized={row.isMain} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className={styles.priceFooter}>
        <div className={styles.marketLinks}>
          <ExternalLink href={cardmarketUrl ?? cardmarketSearchLink(props.card)} className={styles.marketLink}>
            <span className={styles.marketLinkLabel}>Cardmarket</span>
          </ExternalLink>
          <ExternalLink href={props.card.tcgplayer?.url ?? tcgplayerSearchLink(props.card)} className={styles.marketLink}>
            <span className={styles.marketLinkLabel}>TCGplayer</span>
          </ExternalLink>
          <ExternalLink href={priceChartingSearchLink(props.card)} className={styles.marketLink} title={t.priceChartingTitle}>
            <span className={styles.marketLinkLabel}>PriceCharting</span>
          </ExternalLink>
        </div>
        <PriceUpdatedAt updatedAt={props.card.cardmarket?.updatedAt ?? props.card.tcgplayer?.updatedAt} />
      </div>
    </section>
  )
}
