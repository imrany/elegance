import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";

export default function DashboardPage() {
  // Fetch product count
  const { data: products } = useProducts();

  // Fetch orders for statistics
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await api.getAllOrders();
      return response.data;
    },
  });

  // Calculate stats
  const productCount = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders =
    orders?.filter((o) => o.status === "pending").length || 0;
  const totalRevenue =
    orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

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
      icon: Users,
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
        <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome to your admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg border border-border bg-background p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-border bg-background p-6">
        <h2 className="font-serif text-lg font-medium text-foreground">
          Quick Actions
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your store from the sidebar navigation. Configure WhatsApp,
          social media, and store settings in the Settings page.
        </p>
      </div>
    </div>
  );
}
