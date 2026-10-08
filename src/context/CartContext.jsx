import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  function addToCart(product) {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id)

      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }

      return [...currentItems, { ...product, quantity: 1 }]
    })
  }

  function updateQuantity(productId, quantity) {
    setItems(currentItems =>
      currentItems
        .map(item => item.id === productId ? { ...item, quantity } : item)
        .filter(item => item.quantity > 0)
    )
  }

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addToCart,
    updateQuantity
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return cart
}
