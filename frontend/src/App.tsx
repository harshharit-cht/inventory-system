import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import Layout from "@/components/Layout"
import Dashboard from "@/pages/Dashboard"
import Products from "@/pages/Products"
import Customers from "@/pages/Customers"
import Orders from "@/pages/Orders"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </Routes>
      </BrowserRouter>
      {/* Adding richColors prop makes your toast notifications fit the premium theme instantly */}
      <Toaster richColors position="top-right" /> 
    </QueryClientProvider>
  )
}