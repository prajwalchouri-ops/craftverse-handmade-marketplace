import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import CartNotice from './components/CartNotice'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Auth from './pages/Auth'
import ReturnPolicy from './pages/ReturnPolicy'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <CartNotice />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
          </Routes>
          <footer>
            <Link className="navbar-brand" to="/">
              <span className="brand-mark">c</span>
              <span>craftverse<span className="brand-period">.</span></span>
            </Link>
            <p>Made by hand. Found with heart.</p>
            <Link className="footer-policy-link" to="/return-policy">Return &amp; Refund Policy</Link>
            <p>© 2026 CraftVerse</p>
          </footer>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
