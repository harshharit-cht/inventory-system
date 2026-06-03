import api from "@/lib/axios"
import type  { Customer } from "@/types"

export const getCustomers = async (): Promise<Customer[]> => {
  const { data } = await api.get("/customers/")
  return data
}

export const createCustomer = async (customer: Omit<Customer, "id">): Promise<Customer> => {
  const { data } = await api.post("/customers/", customer)
  return data
}

export const deleteCustomer = async (id: number): Promise<void> => {
  await api.delete(`/customers/${id}`)
}