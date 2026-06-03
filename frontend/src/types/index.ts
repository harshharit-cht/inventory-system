export interface Product {
  id: number
  name: string
  sku: string
  price: number
  quantity: number
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
}

export interface OrderItem {
  id: number
  product_id: number
  quantity: number
  unit_price: number
  product?: Product
}

export interface Order {
  id: number
  customer_id: number
  total_amount: number
  created_at: string
  customer?: Customer
  items: OrderItem[]
}

export interface OrderCreate {
  customer_id: number
  items: { product_id: number; quantity: number }[]
}