import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { itemCount } = useCart()
  const { user, signOut } = useAuth()
  const [authError, setAuthError] = useState('')
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account'

  async function handleSignOut() {
    setAuthError('')
    try {
      await signOut()
    } catch (error) {
      setAuthError(error.message)
    }
  }

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

        <div className="navbar-account">
          {user ? (
            <>
              <span className="account-name" title={user.email}>Hi, {displayName}</span>
              <button className="account-action" type="button" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <Link className="account-action" to="/login">Login</Link>
          )}
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
      {authError && <p className="navbar-auth-error" role="alert">{authError}</p>}
    </nav>
  )
}

export default Navbar
