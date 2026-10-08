import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts } from '../data/products'
import { useCart } from '../context/CartContext'
import './Shop.css'

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const { addToCart } = useCart()
  const categories = ['Pottery', 'Jewelry', 'Textiles', 'Woodcraft']
  const categoryParam = searchParams.get('category')
  const selectedCategory = categories.includes(categoryParam) ? categoryParam : 'All'

  useEffect(() => {
    let isActive = true

    getProducts()
      .then(data => {
        if (isActive) setProducts(data)
      })
      .catch(error => {
        if (isActive) setLoadError(error.message)
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = `${product.name} ${product.category} ${product.maker}`.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCategoryChange = (category) => {
    if (category === 'All') {
      setSearchParams({})
    } else {
      setSearchParams({ category })
    }
  }

  return (
    <main className="shop-page">
      <section className="shop-section">
        <div className="section-heading shop-heading">
          <div>
            <p className="eyebrow">A little something special</p>
            <h2>Pieces to <em>keep close.</em></h2>
          </div>
          <p className="shop-intro">Small-batch finds with a story behind every stitch, curve, and brushstroke.</p>
        </div>

        <div className="shop-toolbar">
          <div className="filter-list" role="group">
            <button
              className={`filter-button ${selectedCategory === 'All' ? 'is-selected' : ''}`}
              onClick={() => handleCategoryChange('All')}
            >
              All finds
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-button ${selectedCategory === cat ? 'is-selected' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <label className="search-box">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8"/>
              <path d="m16 16 4.5 4.5"/>
            </svg>
            <input
              type="search"
              aria-label="Search products"
              placeholder="Find something lovely..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <p className="empty-state" role="status">Loading handmade finds...</p>
        ) : loadError ? (
          <p className="empty-state" role="alert">{loadError}</p>
        ) : (
          <>
            <p className="results-note">{filteredProducts.length} thoughtful find{filteredProducts.length !== 1 ? 's' : ''}</p>
            {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <article key={product.id} className="product-card">
                <div className="product-image-wrap">
                  <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                  <span className="product-tag">{product.tag}</span>
                  <button
                    className="quick-add"
                    type="button"
                    aria-label={`Add ${product.name} to bag`}
                    onClick={() => addToCart(product)}
                  >+</button>
                </div>
                <div className="product-meta">
                  <div>
                    <p className="product-maker">{product.maker}</p>
                    <h3 className="product-name">{product.name}</h3>
                  </div>
                  <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="product-rating">
                  <span className="stars">★★★★★</span>
                  <span>{product.rating} ({product.reviews})</span>
                </div>
                <Link to={`/product/${product.id}`} className="details-link">View details</Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No pieces found. Try another search or category.</p>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default Shop
