import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../data/products'
import { useCart } from '../context/CartContext'
import './ProductDetails.css'

function ProductDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isActive = true
    setLoading(true)
    setLoadError('')

    getProductById(id)
      .then(data => {
        if (isActive) setProduct(data)
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
  }, [id])

  if (loading) {
    return <main className="product-details"><p role="status">Loading product...</p></main>
  }

  if (loadError) {
    return <main className="product-details"><p role="alert">{loadError}</p></main>
  }

  if (!product) {
    return (
      <main className="product-details">
        <p>Product not found.</p>
        <Link to="/shop" className="text-link">Back to the shop <span>↗</span></Link>
      </main>
    )
  }

  return (
    <main className="product-details">
      <div className="details-container">
        <img src={product.image} alt={product.name} className="detail-image" />
        <div className="detail-copy">
          <p className="eyebrow">{product.category} · {product.maker}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">₹{product.price.toLocaleString('en-IN')}</p>
          <div className="detail-rating">
            <span className="stars">★★★★★</span>
            <span>{product.rating} ({product.reviews} reviews)</span>
          </div>
          <p className="detail-description">{product.description}</p>
          <p className="detail-maker">Made with care by <strong>{product.maker}</strong></p>
          <button className="button button-dark" onClick={() => addToCart(product)}>
            Add to bag <span>↗</span>
          </button>
        </div>
      </div>
    </main>
  )
}

export default ProductDetails
