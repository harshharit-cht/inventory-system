import api from "@/lib/axios"
import type  { Order, OrderCreate } from "@/types"

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await api.get("/orders/")
  return data
}

export const getOrder = async (id: number): Promise<Order> => {
  const { data } = await api.get(`/orders/${id}`)
  return data
}

export const createOrder = async (order: OrderCreate): Promise<Order> => {
  const { data } = await api.post("/orders/", order)
  return data
}

export const deleteOrder = async (id: number): Promise<void> => {
  await api.delete(`/orders/${id}`)
}