import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './Cart.css'

function Cart() {
  const { items, total, isLoading, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const defaultName = user?.user_metadata?.name ?? ''

  async function handleCheckout(event) {
    event.preventDefault()
    setCheckoutError('')

    if (!user) {
      setLoginPromptOpen(true)
      return
    }

    const formData = new FormData(event.currentTarget)
    const phone = String(formData.get('phone') ?? '').trim()
    if (phone.replace(/\D/g, '').length < 10) {
      setCheckoutError('Enter a phone number with at least 10 digits.')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase.rpc('place_order', {
        p_customer_name: String(formData.get('name') ?? '').trim(),
        p_customer_phone: phone,
        p_shipping_address: String(formData.get('address') ?? '').trim()
      })
      if (error) throw error

      const order = Array.isArray(data) ? data[0] : data
      if (!order?.order_id) throw new Error('The order was not confirmed by the server. Your bag has been kept.')

      setConfirmedOrder({ id: order.order_id, total: Number(order.total) })
      clearCart()
      setCheckoutOpen(false)
    } catch (error) {
      setCheckoutError(error.message || 'We could not place your order. Your bag has been kept.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openCheckout() {
    if (!user) {
      setLoginPromptOpen(true)
      return
    }
    setCheckoutError('')
    setCheckoutOpen(true)
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        <p className="eyebrow">Your lovely finds</p>
        <h1>Your Shopping Bag</h1>

        {isLoading ? (
          <p className="cart-loading" role="status">Loading your saved bag…</p>
        ) : items.length === 0 ? (
          <div className="empty-cart">
            <p>Your bag is waiting for something special.</p>
            <Link to="/shop" className="button button-dark">Explore the collection <span>↗</span></Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <article key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-maker">{item.maker}</p>
                  </div>
                  <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                    <button
                      type="button"
                      aria-label={`Remove one ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >−</button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Add one ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >+</button>
                  </div>
                  <span className="cart-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </article>
              ))}
            </div>

            <div className="cart-summary">
              <div className="subtotal">
                <span>Order total</span>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
              <p>Delivery and payment details are confirmed with your order.</p>
              <button className="button button-dark checkout-button" onClick={openCheckout}>
                Continue to checkout <span>↗</span>
              </button>
            </div>
          </>
        )}
      </div>

      {checkoutOpen && (
        <div className="checkout-overlay" role="presentation">
          <section className="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            <button
              type="button"
              className="checkout-close"
              aria-label="Close checkout"
              onClick={() => setCheckoutOpen(false)}
            >×</button>
            <p className="eyebrow">Almost yours</p>
            <h2 id="checkout-title">Delivery details</h2>
            <p className="checkout-dialog-intro">Add where to send your handmade finds. You’ll pay on delivery; no online payment is collected here.</p>
            <form className="checkout-form" onSubmit={handleCheckout}>
              <label>
                Full name
                <input name="name" autoComplete="name" defaultValue={defaultName} required minLength="2" />
              </label>
              <label>
                Phone number
                <input name="phone" type="tel" autoComplete="tel" required minLength="10" />
              </label>
              <label>
                Delivery address
                <textarea name="address" autoComplete="street-address" rows="3" required minLength="10" />
              </label>
              <div className="checkout-payment">
                <span>Payment</span>
                <strong>Pay on delivery</strong>
              </div>
              <div className="checkout-total">
                <span>Total</span>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
              {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
              <button className="button button-dark checkout-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Placing your order…' : 'Place order'}
              </button>
            </form>
          </section>
        </div>
      )}

      {loginPromptOpen && (
        <div className="checkout-overlay" role="presentation">
          <section className="checkout-dialog checkout-small-dialog" role="dialog" aria-modal="true" aria-labelledby="login-required-title">
            <button
              type="button"
              className="checkout-close"
              aria-label="Close sign-in prompt"
              onClick={() => setLoginPromptOpen(false)}
            >×</button>
            <p className="eyebrow">Your bag is saved</p>
            <h2 id="login-required-title">Sign in to place your order</h2>
            <p className="checkout-dialog-intro">Create an account or sign in so your order and delivery details can be saved securely.</p>
            <Link className="button button-dark checkout-button" to="/login" state={{ from: '/cart' }}>
              Login to continue <span>↗</span>
            </Link>
          </section>
        </div>
      )}

      {confirmedOrder && (
        <div className="checkout-overlay" role="presentation">
          <section className="checkout-dialog order-success-dialog" role="dialog" aria-modal="true" aria-labelledby="order-success-title">
            <span className="order-success-mark" aria-hidden="true">✓</span>
            <p className="eyebrow">Made with care, on its way</p>
            <h2 id="order-success-title">Your order was placed successfully!</h2>
            <p className="checkout-dialog-intro">Thank you for supporting independent makers.</p>
            <div className="order-confirmation">
              <span>Order #{confirmedOrder.id}</span>
              <strong>₹{confirmedOrder.total.toLocaleString('en-IN')}</strong>
              <span>Payment: Pay on delivery</span>
              <span>Status: Processing</span>
            </div>
            <Link className="button button-dark checkout-button" to="/shop">
              Continue shopping <span>↗</span>
            </Link>
          </section>
        </div>
      )}
    </main>
  )
}

export default Cart
