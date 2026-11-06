import { FavoriteButton } from '../../../../../Components/FavoriteButton/FavoriteButton'
import { PokemonCardProp } from '../../../../../util/api/pokemonTGC/model/PokemonCard'
import { cardPriceRows, PriceCell } from '../../../../../util/cardPrice'
import { Currency, formatPrice } from '../../../../../util/format/price'
import { formatPriceDate } from '../../../../../util/format/date'
import { priceChartingSearchLink } from '../../../../../util/shareLinks'
import { ExternalLink } from '../ExternalLink/ExternalLink'
import { GermanListingsLink } from '../GermanListingsLink/GermanListingsLink'
import styles from './CardPrices.module.scss'

function PriceUpdatedAt({ updatedAt }: { updatedAt?: string }) {
  const formatted = formatPriceDate(updatedAt)
  if (formatted == undefined) {
    return null
  }
  return (
    <div className={styles.priceUpdated}>
      Prices from <span className={styles.priceDate}>{formatted}</span>
    </div>
  )
}

function PriceCellContent({ cell, currency, emphasized }: { cell?: PriceCell; currency: Currency; emphasized: boolean }) {
  if (cell == undefined) {
    return <span className={styles.priceMissing}>–</span>
  }
  const amount = formatPrice(cell.amount, currency)
  const highest = formatPrice(cell.highestAmount, currency)
  const text = highest != undefined && highest != amount ? `${amount} to ${highest}` : amount
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

  return (
    <section className={styles.panel}>
      {rows.length == 0 ? (
        <div className={styles.emptyPanel}>No prices available.</div>
      ) : (
        <>
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
          <div className={styles.priceFooter}>
            <ExternalLink
              href={priceChartingSearchLink(props.card)}
              className={styles.priceChartingLink}
              title='Graded and raw prices on PriceCharting'
            >
              <span className={styles.priceChartingLabel}>PriceCharting</span>
            </ExternalLink>
            <PriceUpdatedAt updatedAt={props.card.cardmarket?.updatedAt ?? props.card.tcgplayer?.updatedAt} />
          </div>
        </>
      )}
    </section>
  )
}
