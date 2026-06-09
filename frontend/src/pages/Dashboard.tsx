import { useQuery } from "@tanstack/react-query"
import { getDashboardStats } from "@/api/dashboard"
import { getOrders } from "@/api/orders"
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  loading,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  iconColor: string
  loading: boolean
}) {
  return (
    <Card className="group relative h-32 overflow-hidden rounded-xl border border-zinc-900  p-6 transition-all duration-500 ease-out hover:border-zinc-800">
      
      <div className="absolute -right-4 -bottom-4 pointer-events-none select-none transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-6">
        <Icon 
          className={`h-32 w-32 ${iconColor} opacity-[0.10] filter drop-shadow-[0_0_12px_currentColor] transition-opacity duration-500 group-hover:opacity-[0.12]`} 
        />
      </div>

      {/* Pure, Minimalist Layout Stack */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        
        {/* Title: Clean, muted lowercase or tracking */}
        <div className="text-md font-medium tracking-wider text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
          {title}
        </div>

        {/* Value: Crisp, heavy modern geometry */}
        <CardContent className="p-0">
          {loading ? (
            <Skeleton className="h-9 w-28 bg-zinc-900" />
          ) : (
            <div className="text-4xl font-light tracking-tight text-zinc-200 transition-colors duration-300 group-hover:text-white">
              {value}
            </div>
          )}
        </CardContent>
        
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // auto-refresh every 30s
  })

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  })

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your inventory today.
        </p>
      </div>

      <Badge variant="outline">
        Live Data
      </Badge>
    </div>
  </CardContent>
</Card>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Products"
          value={stats?.total_products ?? 0}
          icon={Package}
          iconColor="text-indigo-500 dark:text-indigo-400"
          loading={statsLoading}
        />
        <StatCard
          title="Total Customers"
          value={stats?.total_customers ?? 0}
          icon={Users}
          iconColor="text-emerald-500 dark:text-emerald-400"
          loading={statsLoading}
        />
        <StatCard
          title="Total Orders"
          value={stats?.total_orders ?? 0}
          icon={ShoppingCart}
          iconColor="text-amber-500 dark:text-amber-400"
          loading={statsLoading}
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.total_revenue ?? 0).toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-rose-500 dark:text-rose-400"
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock */}
        <Card className="dark:border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              Low Stock Products
            </CardTitle>
            {!statsLoading && (
              <Badge variant="secondary" className="font-normal">
                {stats?.low_stock_products.length ?? 0} items
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : stats?.low_stock_products.length === 0 ? (
              <div className="h-32 flex items-center justify-center border border-dashed rounded-lg border-border">
                <p className="text-sm text-muted-foreground">All products are well stocked.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats?.low_stock_products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.sku}</p>
                    </div>
                    <Badge variant={p.quantity === 0 ? "destructive" : "outline"}>
                      {p.quantity === 0 ? "Out of stock" : `${p.quantity} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card className="dark:border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="h-32 flex items-center justify-center border border-dashed rounded-lg border-border">
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {[...orders].reverse().slice(0, 5).map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">Order #{o.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {o.customer?.name ?? "—"} · {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      ${o.total_amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}