import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  UsersRound,
  ToolCase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSiteSetting } from "@/hooks/useSiteSetting";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Account", href: "/admin/account", icon: User },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Users", href: "/admin/users", icon: UsersRound },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Website Builder", href: "/admin/website-builder", icon: ToolCase },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: setting, isLoading: settingIsLoading } =
    useSiteSetting("store");
  const value = (() => {
    if (typeof setting?.value === "string" && setting) {
      try {
        return JSON.parse(setting?.value);
      } catch (e) {
        console.error("Error parsing store settings value:", e);
        return null;
      }
    }
    return null;
  })();
  const siteName = value?.["name"] || "[Your Store Name]";

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth?redirect=/admin");
      } else if (!isAdmin) {
        toast.error("You don't have admin access");
        navigate("/");
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignOut = () => {
    signOut();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent-50 to-accent-100">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-background p-2 shadow-lg lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-background shadow-lg transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border px-6">
            {!settingIsLoading && (
              <>
                <Link
                  to="/"
                  className="font-serif text-xl font-semibold tracking-elegant text-foreground"
                >
                  {siteName}
                </Link>
                <span className="ml-2 rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  Admin
                </span>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="mb-4 text-sm text-muted-foreground">
              Signed in as
              <br />
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        <div className="min-h-screen p-6 pt-16 lg:pt-6">
          <Outlet />
        </div>
      </main>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
