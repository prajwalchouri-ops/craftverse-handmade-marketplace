import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Cart.css'

function Cart() {
  const { items, total, updateQuantity } = useCart()
  const [checkoutMessage, setCheckoutMessage] = useState('')

  return (
    <main className="cart-page">
      <div className="cart-container">
        <p className="eyebrow">Your lovely finds</p>
        <h1>Your Shopping Bag</h1>

        {items.length === 0 ? (
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
                <span>Subtotal</span>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
              <p>Shipping calculated at checkout.</p>
              <button
                className="button button-dark checkout-button"
                onClick={() => setCheckoutMessage('Checkout is a demo feature and is not connected yet.')}
              >
                Continue to checkout <span>↗</span>
              </button>
              {checkoutMessage && <p className="checkout-message" role="status">{checkoutMessage}</p>}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default Cart
