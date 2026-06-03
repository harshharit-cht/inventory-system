import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/api/products"
import type { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Trash2, PackageSearch } from "lucide-react"
import axios from "axios"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
})

type FormData = z.infer<typeof schema>

function ProductForm({
  defaultValues,
  onSubmit,
  loading,
}: {
  defaultValues?: Partial<FormData>
  onSubmit: (data: FormData) => void
  loading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input {...register("name")} placeholder="Product name" className="bg-background" />
        {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>SKU</Label>
        <Input {...register("sku")} placeholder="e.g. LAP-001" className="bg-background" />
        {errors.sku && <p className="text-xs font-medium text-destructive">{errors.sku.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price ($)</Label>
          <Input {...register("price")} type="number" step="0.01" placeholder="0.00" className="bg-background" />
          {errors.price && <p className="text-xs font-medium text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input {...register("quantity")} type="number" placeholder="0" className="bg-background" />
          {errors.quantity && <p className="text-xs font-medium text-destructive">{errors.quantity.message}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading ? "Saving..." : "Save Product"}
      </Button>
    </form>
  )
}

export default function Products() {
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  })

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
      setAddOpen(false)
      toast.success("Product created")
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.detail ?? "Failed to create product")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => updateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
      setEditProduct(null)
      toast.success("Product updated")
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.detail ?? "Failed to update product")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
      toast.success("Product deleted")
    },
  })

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your inventory ({products.length} total)
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSubmit={createMutation.mutate} loading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="dark:border-border/50">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 border border-dashed border-border rounded-xl bg-card/50">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <PackageSearch className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No products found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            You haven't added any products to your inventory yet. Click the button above to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <Card key={product.id} className="transition-all hover:shadow-md dark:hover:shadow-none dark:border-border/50 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base font-semibold leading-tight text-foreground line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs font-mono shrink-0 bg-background">
                    {product.sku}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                <div className="space-y-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold text-foreground">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Stock</span>
                    <Badge variant={product.quantity === 0 ? "destructive" : product.quantity <= 5 ? "outline" : "secondary"}>
                      {product.quantity} units
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Dialog open={editProduct?.id === product.id} onOpenChange={(o) => !o && setEditProduct(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 bg-background hover:bg-muted" onClick={() => setEditProduct(product)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                      </DialogHeader>
                      <ProductForm
                        defaultValues={product}
                        onSubmit={(data) => updateMutation.mutate({ id: product.id, data })}
                        loading={updateMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive" size="sm" className="flex-1"
                    onClick={() => deleteMutation.mutate(product.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}