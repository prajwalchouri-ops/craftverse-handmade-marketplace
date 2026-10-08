import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'craftverse-guest-cart'

function readGuestCart() {
  const savedCart = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]')
  if (!Array.isArray(savedCart)) throw new Error('Your saved bag data is invalid. Clear your browser storage and try again.')
  return savedCart
}

function saveGuestCart(items) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

function mapDatabaseCart(rows = []) {
  return rows
    .filter(row => row.products)
    .map(row => ({ ...row.products, price: Number(row.products.price), quantity: row.quantity }))
}

export function CartProvider({ children }) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState(null)

  const loadUserCart = useCallback(async (userId, includeGuestItems = false) => {
    const guestItems = includeGuestItems ? readGuestCart() : []
    if (guestItems.length) {
      const { error: mergeError } = await supabase.rpc('merge_guest_cart', {
        p_items: guestItems.map(item => ({ product_id: item.id, quantity: item.quantity }))
      })
      if (mergeError) throw mergeError
      window.localStorage.removeItem(CART_STORAGE_KEY)
    }

    const { data, error } = await supabase
      .from('cart')
      .select('product_id, quantity, products(id, name, description, price, category, image, maker, rating, review_count, stock, is_active)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return mapDatabaseCart(data)
  }, [])

  useEffect(() => {
    if (isAuthLoading) return undefined

    let isCurrent = true
    async function loadCart() {
      setIsLoading(true)
      try {
        if (user) {
          const savedItems = await loadUserCart(user.id, true)
          if (isCurrent) setItems(savedItems)
        } else if (isCurrent) {
          setItems(readGuestCart())
        }
      } catch (error) {
        if (isCurrent) {
          let unsyncedGuestItems = []
          let loadErrorMessage = error.message
          if (user) {
            try {
              unsyncedGuestItems = readGuestCart()
            } catch (storageError) {
              loadErrorMessage = `${loadErrorMessage} Could not read this device's saved bag: ${storageError.message}`
            }
          }
          setItems(unsyncedGuestItems)
          setNotice({ type: 'error', message: `Could not load your saved bag: ${loadErrorMessage}` })
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadCart()
    return () => { isCurrent = false }
  }, [isAuthLoading, loadUserCart, user])

  useEffect(() => {
    if (isAuthLoading || isLoading || user) return
    try {
      saveGuestCart(items)
    } catch (error) {
      setNotice({ type: 'error', message: `Could not save your bag on this device: ${error.message}` })
    }
  }, [isAuthLoading, isLoading, items, user])

  const addToCart = useCallback(async product => {
    if (user) {
      try {
        const { error } = await supabase.rpc('add_item_to_cart', { p_product_id: product.id })
        if (error) throw error
        setItems(await loadUserCart(user.id))
        setNotice({ type: 'success', message: `${product.name} was added to your saved bag.` })
      } catch (error) {
        setNotice({ type: 'error', message: `Could not add this item: ${error.message}` })
      }
      return
    }

    const existingItem = items.find(item => item.id === product.id)
    const updatedItems = existingItem
      ? items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...items, { ...product, quantity: 1 }]
    setItems(updatedItems)
    setNotice({ type: 'success', message: `${product.name} was added to your bag on this device. Sign in to sync it to your account.` })
  }, [items, loadUserCart, user])

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!user) {
      setItems(items
        .map(item => item.id === productId ? { ...item, quantity } : item)
        .filter(item => item.quantity > 0))
      return
    }

    const previousItems = items
    setItems(currentItems => currentItems
      .map(item => item.id === productId ? { ...item, quantity } : item)
      .filter(item => item.quantity > 0))

    try {
      const { error } = await supabase.rpc('set_cart_quantity', {
        p_product_id: productId,
        p_quantity: quantity
      })
      if (error) throw error
    } catch (error) {
      setItems(previousItems)
      setNotice({ type: 'error', message: `Could not update your bag: ${error.message}` })
    }
  }, [items, user])

  const clearCart = useCallback(() => {
    setItems([])
    window.localStorage.removeItem(CART_STORAGE_KEY)
  }, [])

  const dismissNotice = useCallback(() => setNotice(null), [])

  const value = useMemo(() => ({
    items,
    isLoading,
    notice,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addToCart,
    updateQuantity,
    clearCart,
    dismissNotice,
    setNotice
  }), [addToCart, clearCart, dismissNotice, isLoading, items, notice, updateQuantity])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return cart
}
