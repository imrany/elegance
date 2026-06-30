import { useQuery } from "@tanstack/react-query";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  PlusCircle,
  Settings,
  ArrowRight,
  MailWarning,
  MessageCircleWarning,
  ToolCase,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useGeneralContext } from "@/contexts/GeneralContext";

export default function DashboardPage() {
  const { websiteConfig } = useGeneralContext();
  const smtp = websiteConfig?.smtp;
  const whatsapp = websiteConfig?.whatsapp;

  // Fetch product count
  const { data: products, isLoading: isLoadingProducts } = useProducts();

  // Fetch orders for statistics
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await api.getAllOrders();
      return response;
    },
  });

  const isLoading = isLoadingProducts || isLoadingOrders;

  // Calculate stats
  const productCount = products?.length || 0;
  const totalOrders = orders?.length || 0;

  const pendingOrders =
    orders?.filter((o) => o.status === "pending").length || 0;

  // Strictly calculate total revenue based on completed or active tracking states
  const totalRevenue =
    orders?.reduce((sum, order) => {
      const isRevenueValid = ["paid", "shipped", "delivered"].includes(
        order.status?.toLowerCase(),
      );
      return sum + (isRevenueValid ? Number(order.total || 0) : 0);
    }, 0) || 0;

  const stats = [
    {
      name: "Total Products",
      value: productCount.toString(),
      icon: Package,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      name: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: "bg-green-500/10 text-green-500",
    },
    {
      name: "Pending Orders",
      value: pendingOrders.toString(),
      icon: Clock, // Semi-accurate status mapping icon
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      name: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-light tracking-tight text-foreground md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to your admin dashboard overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="border border-border bg-background p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                  {stat.name}
                </p>
                {isLoading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Panel Workspace */}
      <div className="md:col-span-2 border border-border bg-background p-6  flex gap-4 flex-col justify-between">
        <div className="space-y-1">
          <h2 className="font-serif text-lg font-medium text-foreground">
            Quick Actions
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Expedite your storefront configurations. Add inventory updates,
            analyze active checkout pipelines, or configure your payment
            gateways instantly.
          </p>
        </div>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <Link
            to="/admin/products"
            className="flex items-center justify-between p-3 border border-border hover:border-foreground/40 hover:bg-muted/50 rounded-sm group transition-all text-sm font-medium"
          >
            <span className="flex items-center gap-2.5">
              <PlusCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              Add New Product
            </span>
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
          </Link>

          <Link
            to="/admin/settings?tab=store"
            className="flex items-center justify-between p-3 border border-border hover:border-foreground/40 hover:bg-muted/50 rounded-sm group transition-all text-sm font-medium"
          >
            <span className="flex items-center gap-2.5">
              <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              Store Settings
            </span>
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {smtp && !smtp.is_configured && (
            <Link
              to="/admin/settings?tab=smtp"
              className="flex items-center justify-between p-3 border border-border hover:border-foreground/40 hover:bg-muted/50 rounded-sm group transition-all text-sm font-medium"
            >
              <span className="flex items-center gap-2.5">
                <MailWarning className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                Setup SMTP (Email)
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
            </Link>
          )}

          {whatsapp && !whatsapp.phone && (
            <Link
              to="/admin/settings?tab=whatsapp"
              className="flex items-center justify-between p-3 border border-border hover:border-foreground/40 hover:bg-muted/50 rounded-sm group transition-all text-sm font-medium"
            >
              <span className="flex items-center gap-2.5">
                <MessageCircleWarning className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                Setup Whatsapp
              </span>
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
            </Link>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/admin/website-builder"
            className="flex items-center justify-between p-3 border border-border hover:border-foreground/40 hover:bg-muted/50 rounded-sm group transition-all text-sm font-medium"
          >
            <span className="flex items-center gap-2.5">
              <ToolCase className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              Build your website
            </span>
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}
