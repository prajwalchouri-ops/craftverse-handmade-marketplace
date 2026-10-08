import { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import './CartNotice.css'

function CartNotice() {
  const { notice, dismissNotice } = useCart()

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(dismissNotice, 4500)
    return () => window.clearTimeout(timeout)
  }, [dismissNotice, notice])

  if (!notice) return null

  return (
    <div className={`cart-notice cart-notice-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
      <span>{notice.message}</span>
      <button type="button" aria-label="Dismiss notification" onClick={dismissNotice}>×</button>
    </div>
  )
}

export default CartNotice
