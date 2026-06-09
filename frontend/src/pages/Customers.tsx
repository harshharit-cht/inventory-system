import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { getCustomers, createCustomer, deleteCustomer } from "@/api/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, Mail, Phone, Users } from "lucide-react"
import axios from "axios"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
})

type FormData = z.infer<typeof schema>

export default function Customers() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] })
      setOpen(false)
      reset()
      toast.success("Customer added")
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.detail ?? "Failed to add customer")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Customer deleted")
    },
  })

  // Helper to get initials for the avatar placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Customers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your client list ({customers.length} total)
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input {...register("name")} placeholder="John Doe" className="bg-background" />
                {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...register("email")} type="email" placeholder="john@example.com" className="bg-background" />
                {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...register("phone")} placeholder="+91 98376 54892" className="bg-background" />
                {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>}
              </div>
              <Button type="submit" className="w-full mt-2" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Add Customer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="dark:border-border/50">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-9 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 border border-dashed border-border rounded-xl bg-card/50">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No customers found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            You don't have any customers in your database yet. Click the button above to add your first one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {customers.map((c) => (
            <Card key={c.id} className="transition-all hover:shadow-md dark:hover:shadow-none dark:border-border/50 flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0 border border-primary/20">
                    {getInitials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">ID: {c.id}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground mb-6 flex-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span className="truncate">{c.phone}</span>
                  </div>
                </div>

                <Button
                  variant="destructive" size="sm" className="w-full mt-auto"
                  onClick={() => deleteMutation.mutate(c.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}