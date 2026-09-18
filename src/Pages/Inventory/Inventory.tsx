import { useContext, useEffect } from 'react'
import { HeaderContext } from '../../Header/HeaderProvider'
import styles from './Inventory.module.scss'

export default function Inventory() {
  const { setHeaderItem } = useContext(HeaderContext)

  useEffect(() => {
    setHeaderItem(undefined)
  }, [setHeaderItem])

  return (
    <div className={styles.inventory}>
      A placeholder for an inventory that holds all cards, preferably with condition, price at time of purchase and current price pulled
      from an API.
    </div>
  )
}
