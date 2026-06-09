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
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Trash2, PackageSearch } from "lucide-react"
import { cn } from "@/lib/utils"
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
      <div className="space-y-2">
        <Label className="text-[13px] font-medium text-foreground">Name</Label>
        <Input {...register("name")} placeholder="Product name" className="bg-background" />
        {errors.name && <p className="text-[12px] font-medium text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label className="text-[13px] font-medium text-foreground">SKU</Label>
        <Input {...register("sku")} placeholder="e.g. LAP-001" className="bg-background font-mono text-[13px]" />
        {errors.sku && <p className="text-[12px] font-medium text-destructive">{errors.sku.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-foreground">Price (₹)</Label>
          <Input {...register("price")} type="number" step="0.01" placeholder="0.00" className="bg-background" />
          {errors.price && <p className="text-[12px] font-medium text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="text-[13px] font-medium text-foreground">Quantity</Label>
          <Input {...register("quantity")} type="number" placeholder="0" className="bg-background" />
          {errors.quantity && <p className="text-[12px] font-medium text-destructive">{errors.quantity.message}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full mt-4" disabled={loading}>
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
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-[36px] font-medium tracking-[-0.02em] text-foreground leading-tight">
            Products
          </h2>
          <p className="text-[16px] text-muted-foreground font-normal">
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
              <DialogTitle className="text-[18px] font-medium tracking-tight">Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSubmit={createMutation.mutate} loading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className="rounded-[12px] border border-border bg-card overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-none">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border bg-muted/20">
              <TableHead className="w-[40%] text-[13px] font-medium text-muted-foreground h-11">Product</TableHead>
              <TableHead className="text-[13px] font-medium text-muted-foreground h-11">SKU</TableHead>
              <TableHead className="text-[13px] font-medium text-muted-foreground h-11">Price</TableHead>
              <TableHead className="text-[13px] font-medium text-muted-foreground h-11">Stock</TableHead>
              <TableHead className="text-right text-[13px] font-medium text-muted-foreground h-11">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border">
                  <TableCell><Skeleton className="h-5 w-3/4 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16 rounded-md" />
                      <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              // Empty State
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="p-3 rounded-full bg-muted/50 mb-4 border border-border/50">
                      <PackageSearch className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-[15px] font-medium text-foreground mb-1">No products found</h3>
                    <p className="text-[14px] text-muted-foreground max-w-sm">
                      You haven't added any products to your inventory yet.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Product Rows
              products.map((product) => (
                <TableRow key={product.id} className="border-b border-border transition-colors hover:bg-muted/30">
                  <TableCell className="font-medium text-[14px] text-foreground">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[13px] text-muted-foreground bg-secondary px-2 py-1 rounded-[4px] border border-border/50">
                      {product.sku}
                    </span>
                  </TableCell>
                  <TableCell className="text-[14px] text-foreground">
                    ₹{product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "rounded-[4px] shadow-none text-[12px] font-normal border px-2 py-0.5",
                        product.quantity === 0 
                          ? "bg-destructive/10 text-destructive border-destructive/20" 
                          : product.quantity <= 5 
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-transparent text-foreground border-border"
                      )}
                    >
                      {product.quantity === 0 ? "Out of stock" : `${product.quantity} in stock`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={editProduct?.id === product.id} onOpenChange={(o) => !o && setEditProduct(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-3 text-[13px] bg-background" onClick={() => setEditProduct(product)}>
                            <Pencil className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="text-[18px] font-medium tracking-tight">Edit Product</DialogTitle>
                          </DialogHeader>
                          <ProductForm
                            defaultValues={product}
                            onSubmit={(data) => updateMutation.mutate({ id: product.id, data })}
                            loading={updateMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3 text-[13px] text-destructive hover:text-destructive hover:bg-destructive/10 border-border"
                        onClick={() => deleteMutation.mutate(product.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}