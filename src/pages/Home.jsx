import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../data/products'
import { useCart } from '../context/CartContext'
import './Home.css'

function Home() {
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [products, setProducts] = useState([])
  const [productsError, setProductsError] = useState('')
  const { addToCart } = useCart()

  useEffect(() => {
    let isActive = true

    getProducts()
      .then(data => {
        if (isActive) setProducts(data)
      })
      .catch(error => {
        if (isActive) setProductsError(error.message)
      })

    return () => {
      isActive = false
    }
  }, [])
  const categories = [
    {
      id: 1,
      name: 'Pottery',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      name: 'Jewelry',
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      name: 'Textiles',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      name: 'Woodcraft',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
    }
  ]

  return (
    <main className="home-page">
      <section className="announcement">
        <span>Thoughtfully made, made to be treasured</span>
        <span className="announcement-accent">✦</span>
        <span>Free delivery on orders over ₹1,499</span>
      </section>

      <section className="hero">
        <img
          className="hero-image"
          src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=2000&q=85"
          alt="Handmade pottery and natural textures"
        />
        <div className="hero-shade"></div>
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">
            <span></span> A marketplace with meaning
          </p>
          <h1>Handmade.<br />Heartfelt.<br /><em>Timeless.</em></h1>
          <p className="hero-copy">
            Discover thoughtful pieces, made slowly and lovingly by independent artisans across India.
          </p>
          <Link to="/shop" className="button button-light">
            Explore the collection <span>↗</span>
          </Link>
          <div className="hero-note">
            <span className="note-line"></span>
            Every piece has a story to tell.
          </div>
        </div>
        <div className="hero-stamp">
          <span>MADE WITH<br />INTENTION</span>
          <b>✳</b>
        </div>
      </section>

      <section className="categories-section" id="categories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Find your kind of handmade</p>
            <h2>Made for <em>everyday</em> moments.</h2>
          </div>
          <Link to="/shop" className="text-link">Explore all <span>↗</span></Link>
        </div>
        <div className="category-grid">
          {categories.map((cat, idx) => (
            <Link key={cat.id} to={`/shop?category=${encodeURIComponent(cat.name)}`} className="category-card">
              <img src={cat.image} alt={cat.name} />
              <span className="category-number">0{idx + 1}</span>
              <span className="category-name">{cat.name} <span>↗</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-featured">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A little something special</p>
            <h2>Pieces to <em>keep close.</em></h2>
          </div>
          <Link to="/shop" className="text-link">Explore all <span>↗</span></Link>
        </div>
        {productsError ? (
          <p role="alert" className="empty-state">{productsError}</p>
        ) : (
          <div className="product-grid">
            {products.slice(0, 6).map(product => (
            <article key={product.id} className="product-card">
              <div className="product-image-wrap">
                <img className="product-image" src={product.image} alt={product.name} loading="lazy" />
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
              <Link to={`/product/${product.id}`} className="details-link">View details</Link>
            </article>
            ))}
          </div>
        )}
      </section>

      <section className="featured-band" id="about">
        <div className="featured-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1200&q=85"
            alt="A potter shaping ceramic"
          />
          <span className="image-caption">Little imperfections. A lot of heart.</span>
        </div>
        <div className="featured-copy">
          <p className="eyebrow">More than just a marketplace</p>
          <h2>Good things take<br /><em>good hands.</em></h2>
          <p>We bring you closer to the people behind the pieces. Each find is made in small batches, with thoughtful materials and a whole lot of care.</p>
          <Link to="/shop" className="text-link">Meet your next favourite <span>↗</span></Link>
          <div className="maker-note">
            <span className="maker-star">✳</span>
            <span>Made by independent<br />Indian artisans</span>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="newsletter-spark">✳</div>
        <p className="eyebrow">A little goodness in your inbox</p>
        <h2>Notes from the <em>makers.</em></h2>
        <p>New finds, artisan stories, and the occasional bit of inspiration.</p>
        <form className="newsletter-form" onSubmit={(e) => {
          e.preventDefault()
          e.currentTarget.reset()
          setNewsletterMessage("You're on the list. Thanks for joining us!")
        }}>
          <input type="email" placeholder="Your email address" aria-label="Your email address" required />
          <button type="submit">Join us <span>↗</span></button>
        </form>
        <p className="newsletter-message" role="status">{newsletterMessage}</p>
      </section>
    </main>
  )
}

export default Home
