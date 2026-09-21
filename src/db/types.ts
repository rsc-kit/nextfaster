export interface Collection {
  id: number
  name: string
  slug: string
}

export interface Category {
  slug: string
  name: string
  collection_id: number
  image_url: string | null
}

export interface Subcollection {
  id: number
  name: string
  category_slug: string
}

export interface Subcategory {
  slug: string
  name: string
  subcollection_id: number
  image_url: string | null
}

export interface Product {
  slug: string
  name: string
  description: string
  price: number
  subcategory_slug: string
  image_url: string | null
}

export interface User {
  id: number
  username: string
  password_hash: string
}
