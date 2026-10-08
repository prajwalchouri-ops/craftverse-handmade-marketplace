import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import { CartProvider } from './context/CartContext'
import './App.css'

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
        <footer>
          <Link className="navbar-brand" to="/">
            <span className="brand-mark">c</span>
            <span>craftverse<span className="brand-period">.</span></span>
          </Link>
          <p>Made by hand. Found with heart.</p>
          <p>© 2026 CraftVerse</p>
        </footer>
      </Router>
    </CartProvider>
  )
}

export default App
