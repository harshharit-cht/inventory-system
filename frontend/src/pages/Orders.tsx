import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { getOrders, createOrder, deleteOrder } from "@/api/orders"
import { getProducts } from "@/api/products"
import { getCustomers } from "@/api/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Trash2, ChevronDown, ChevronUp, Receipt } from "lucide-react"
import axios from "axios"

const schema = z.object({
  customer_id: z.coerce.number().min(1, "Select a customer"),
  items: z.array(z.object({
    product_id: z.coerce.number().min(1, "Select a product"),
    quantity: z.coerce.number().int().min(1, "Min quantity is 1"),
  })).min(1, "Add at least one item"),
})

type FormData = z.infer<typeof schema>

export default function Orders() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)

  const { data: orders = [], isLoading } = useQuery({ queryKey: ["orders"], queryFn: getOrders })
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: getProducts })
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: getCustomers })

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ product_id: 0, quantity: 1 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
      setOpen(false)
      reset()
      toast.success("Order created")
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.detail ?? "Failed to create order")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
      toast.success("Order cancelled")
    },
  })

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer orders ({orders.length} total)
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6 pt-2">
              {/* Customer select */}
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select onValueChange={(v) => setValue("customer_id", Number(v))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customer_id && <p className="text-xs font-medium text-destructive">{errors.customer_id.message}</p>}
              </div>

              {/* Order items */}
              <div className="space-y-3">
                <Label>Items</Label>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <Select onValueChange={(v) => setValue(`items.${index}.product_id`, Number(v))}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)} disabled={p.quantity === 0}>
                                {p.name} (${p.price} — {p.quantity} left)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        {...register(`items.${index}.quantity`)}
                        type="number" min={1} placeholder="Qty"
                        className="w-24 bg-background"
                      />
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.items && <p className="text-xs font-medium text-destructive">{errors.items.message}</p>}
                <Button
                  type="button" variant="outline" size="sm" className="w-full mt-2 border-dashed bg-muted/30"
                  onClick={() => append({ product_id: 0, quantity: 1 })}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />Add Another Item
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Placing order..." : "Place Order"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="dark:border-border/50">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex gap-4 pt-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-24 px-4 border border-dashed border-border rounded-xl bg-card/50">
           <div className="p-4 rounded-full bg-muted/50 mb-4">
             <Receipt className="h-8 w-8 text-muted-foreground" />
           </div>
           <h3 className="text-lg font-semibold text-foreground mb-1">No orders found</h3>
           <p className="text-sm text-muted-foreground text-center max-w-sm">
             You haven't received any orders yet. Click the button above to create a new order manually.
           </p>
         </div>
      ) : (
        <div className="space-y-4">
          {[...orders].reverse().map((order) => (
            <Card key={order.id} className="transition-all hover:shadow-sm dark:hover:shadow-none dark:border-border/50 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-semibold text-foreground">Order #{order.id}</CardTitle>
                    <Badge variant="secondary" className="font-normal bg-muted">{order.items.length} item(s)</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold tracking-tight text-foreground">${order.total_amount.toFixed(2)}</span>
                    <Button
                      variant="ghost" size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      {expandedOrder === order.id
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 text-xs font-medium text-muted-foreground mt-1">
                  <span>Customer: <span className="text-foreground/80">{order.customer?.name ?? `#${order.customer_id}`}</span></span>
                  <span>•</span>
                  <span>{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </CardHeader>

              {expandedOrder === order.id && (
                <div className="bg-muted/20 border-t border-border/50">
                  <CardContent className="pt-4 pb-4 space-y-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-foreground">{item.product?.name ?? `Product #${item.product_id}`}</span>
                          <span className="text-muted-foreground tabular-nums">
                            {item.quantity} × ${item.unit_price.toFixed(2)}
                            <span className="text-muted-foreground mx-2">=</span>
                            <span className="font-semibold text-foreground">
                              ${(item.quantity * item.unit_price).toFixed(2)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end pt-2 border-t border-border/50 border-dashed">
                      <Button
                        variant="destructive" size="sm"
                        className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => deleteMutation.mutate(order.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />Cancel Order
                      </Button>
                    </div>
                  </CardContent>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}