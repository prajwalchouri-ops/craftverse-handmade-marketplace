import { supabase } from '../lib/supabase'

function formatProduct(row) {
  return {
    ...row,
    image: row.image,
    reviews: row.review_count
  }
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('id')

  if (error) {
    throw new Error(`Could not load products: ${error.message}`)
  }

  return data.map(formatProduct)
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    throw new Error(`Could not load product: ${error.message}`)
  }

  return data ? formatProduct(data) : null
}
