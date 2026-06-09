import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, Package, Users, ShoppingCart, Menu, X, Sparkles } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30 text-foreground flex font-sans selection:bg-primary/20">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-md z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-72 bg-card/50 backdrop-blur-xl border-r border-border/40 z-50 transform transition-transform duration-500 ease-out flex flex-col",
          "lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.1)]" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground bg-clip-text">
              Inventory<span className="text-primary">.</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-4">
            Main Menu
          </div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 overflow-hidden",
                  isActive
                    ? "text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 border border-primary/10 rounded-2xl -z-10" />
                  )}
                  <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-background/60 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Workspace / <span className="text-foreground font-semibold">Overview</span>
            </h1>
          </div>

          {/* You can add a user avatar or dark mode toggle here later */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm ring-2 ring-background cursor-pointer hover:scale-105 transition-transform">
              HH
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-transparent p-2 sm:p-2 lg:p-0 scroll-smooth">
          <div className="">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}