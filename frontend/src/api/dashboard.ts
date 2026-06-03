import api from "@/lib/axios"

export interface DashboardStats {
  total_products: number
  total_customers: number
  total_orders: number
  total_revenue: number
  low_stock_products: {
    id: number
    name: string
    sku: string
    quantity: number
  }[]
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/dashboard/stats")
  return data
}