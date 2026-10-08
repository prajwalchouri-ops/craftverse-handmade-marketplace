import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Navbar.css'

function Navbar() {
  const { itemCount } = useCart()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-mark">c</span>
          <span>craftverse<span className="brand-period">.</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/#categories">Categories</Link>
          <Link to="/#about">Our Story</Link>
        </div>

        <Link to="/cart" className="cart-trigger">
          <svg viewBox="0 0 24 24">
            <path d="M5 8h14l1 12H4L5 8Z"/>
            <path d="M9 9V6a3 3 0 0 1 6 0v3"/>
          </svg>
          <span>Bag</span>
          <span className="cart-count">{itemCount}</span>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
