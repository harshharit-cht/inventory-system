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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Trash2, Receipt } from "lucide-react"
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
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-[36px] font-medium tracking-[-0.02em] text-foreground leading-tight">
            Orders
          </h2>
          <p className="text-[16px] text-muted-foreground font-normal">
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
              <DialogTitle className="text-[18px] font-medium tracking-tight">Create New Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6 pt-2">
              {/* Customer select */}
              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-foreground">Customer</Label>
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
                {errors.customer_id && <p className="text-[12px] font-medium text-destructive">{errors.customer_id.message}</p>}
              </div>

              {/* Order items */}
              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-foreground">Items</Label>
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
                                {p.name} (₹{p.price} — {p.quantity} left)
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
                        <Button type="button" variant="ghost" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.items && <p className="text-[12px] font-medium text-destructive">{errors.items.message}</p>}
                <Button
                  type="button" variant="outline" size="sm" className="w-full mt-2 border-dashed bg-muted/30 hover:bg-muted text-[13px]"
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
      <div className="rounded-[12px] border border-border bg-card overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-none">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border bg-muted/20">
              <TableHead className="w-[120px] text-[13px] font-medium text-muted-foreground h-11">Order ID</TableHead>
              <TableHead className="w-[180px] text-[13px] font-medium text-muted-foreground h-11">Customer</TableHead>
              <TableHead className="text-[13px] font-medium text-muted-foreground h-11">Order Details</TableHead>
              <TableHead className="w-[140px] text-[13px] font-medium text-muted-foreground h-11">Date</TableHead>
              <TableHead className="w-[120px] text-[13px] font-medium text-muted-foreground h-11">Total</TableHead>
              <TableHead className="w-[100px] text-right text-[13px] font-medium text-muted-foreground h-11">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border">
                  <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-3/4 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              // Empty State
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="p-3 rounded-full bg-muted/50 mb-4 border border-border/50">
                      <Receipt className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-[15px] font-medium text-foreground mb-1">No orders found</h3>
                    <p className="text-[14px] text-muted-foreground max-w-sm">
                      You haven't received any orders yet.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Order Rows
              [...orders].reverse().map((order) => {
                // Generate a preview string of the items (e.g. "2x Laptop, 1x Mouse")
                const itemPreview = order.items
                  .map(item => `${item.quantity}x ${item.product?.name ?? `Item #${item.product_id}`}`)
                  .join(', ')

                return (
                  <TableRow key={order.id} className="border-b border-border transition-colors hover:bg-muted/30">
                    <TableCell className="font-mono text-[13px] text-foreground font-medium">
                      #{order.id}
                    </TableCell>
                    <TableCell className="text-[14px] text-foreground">
                      {order.customer?.name ?? `ID: ${order.customer_id}`}
                    </TableCell>
                    <TableCell>
                      <div className="text-[13px] text-muted-foreground max-w-[350px] truncate" title={itemPreview}>
                        {itemPreview}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">
                      {new Date(order.created_at || Date.now()).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-[14px] font-medium text-foreground">
                      ₹{order.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3 text-[13px] text-destructive hover:text-destructive hover:bg-destructive/10 border-border"
                        onClick={() => deleteMutation.mutate(order.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}