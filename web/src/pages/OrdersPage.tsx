import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { api, Order } from "@/lib/api";
import {
  formatPrice,
  formatShortDate,
  getPaymentBadge,
  getStatusBadge,
  statusColors,
} from "@/lib/utils";
import {
  ShoppingBag,
  Package,
  Search,
  Loader2,
  Eye,
  Calendar,
  CreditCard,
  Download,
  X,
  MapPin,
  Phone,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useOrder } from "@/contexts/OrderContext";
import SidePanel, {
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelBody,
  PanelFooter,
  PanelClose,
} from "@/components/common/SidePanel";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function OrdersPage() {
  const {
    orders,
    isLoading,
    orderCount,
    orderStatusCount,
    totalSpent,
    getOrders,
  } = useOrder();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const currentOrder = orders?.find((order) => order.id === id);

      if (!currentOrder) {
        throw new Error("Order not found in local cache.");
      }

      const updatePayload: { status: string; payment_status: string } = {
        status: status,
        payment_status: currentOrder.payment_status,
      };

      if (status === "cancelled" && currentOrder.payment_status !== "paid") {
        updatePayload.payment_status = "failed";
      } else if (
        status !== "delivered" &&
        currentOrder.payment_status !== "failed"
      ) {
        updatePayload.payment_status = "paid";
      }
      await api.updateOrder(id, updatePayload);
    },
    onSuccess: () => {
      getOrders();
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update order status");
    },
  });

  // Filter orders by search
  const filteredOrders = orders?.filter((order) => {
    const searchLower = search.toLowerCase();
    return (
      order.id?.toLowerCase().includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchLower))
    );
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleDownloadInvoice = (orderId: string) => {
    // This would typically generate a PDF invoice
    toast.success("Invoice download started");
    // Implementation: window.open(`/api/orders/${orderId}/invoice`);
  };

  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            My Orders
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage your order history
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{orderCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {orderStatusCount?.pending || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {formatPrice(totalSpent?.completed || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        {!isLoading && orders && (
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Orders List */}
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <p className="mt-4 text-muted-foreground">Loading orders...</p>
            </CardContent>
          </Card>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 font-serif text-xl font-light text-foreground">
                {search ? "No orders found" : "No orders yet"}
              </h3>
              <p className="mt-2 text-center text-muted-foreground">
                {search
                  ? "Try adjusting your search criteria"
                  : "Start shopping to see your orders here"}
              </p>
              {!search && (
                <Button asChild className="mt-6">
                  <Link to="/">Start Shopping</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const paymentBadge = getPaymentBadge(order.payment_status);

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-secondary/30 pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Order #{order.id?.substring(0, 8)}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatShortDate(order.created_at)}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${paymentBadge.color}`}
                        >
                          {paymentBadge.label}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {/* Items Preview */}
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div
                              key={index}
                              className="h-12 w-12 overflow-hidden rounded-full border-2 border-background bg-secondary"
                            >
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-secondary text-xs font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex justify-between w-full">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {order.items.length}{" "}
                              {order.items.length === 1 ? "item" : "items"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.items
                                .slice(0, 2)
                                .map((item) => item.name)
                                .join(", ")}
                              {order.items.length > 2 && "..."}
                            </p>
                          </div>
                          {order.status !== "delivered" &&
                            order.status !== "cancelled" &&
                            order.status !== "shipped" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="flex items-center gap-1">
                                    <Badge
                                      className={`capitalize ${statusColors[order.status] || ""}`}
                                      variant="secondary"
                                    >
                                      {order.status}
                                    </Badge>

                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  {["delivered", "cancelled"].map((status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      onClick={() =>
                                        updateStatusMutation.mutate({
                                          id: order.id,
                                          status,
                                        })
                                      }
                                      className="capitalize"
                                    >
                                      {status}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                        </div>
                      </div>

                      <Separator />

                      {/* Order Total and Actions */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-foreground">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(order.id!)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Order Details SidePanel */}
        {selectedOrder && (
          <SidePanel isOpen={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <PanelHeader>
              <div className="flex items-start justify-between">
                <div>
                  <PanelTitle>
                    Order #{selectedOrder.id?.substring(0, 8)}
                  </PanelTitle>
                  <PanelDescription>
                    {formatShortDate(selectedOrder.created_at)}
                  </PanelDescription>
                </div>
                <div className="text-right space-y-1">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(selectedOrder.status).color}`}
                  >
                    {getStatusBadge(selectedOrder.status).label}
                  </span>
                  <br />
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getPaymentBadge(selectedOrder.payment_status).color}`}
                  >
                    {getPaymentBadge(selectedOrder.payment_status).label}
                  </span>
                </div>
              </div>
            </PanelHeader>
            <PanelBody>
              <div className="flex flex-col gap-4">
                {/* Items */}
                <div>
                  <h3 className="mb-3 font-medium">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-border bg-secondary">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                            {item.size && ` · Size: ${item.size}`}
                            {item.color && ` · Color: ${item.color}`}
                          </p>
                          <p className="mt-1 font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>
                      {selectedOrder.delivery_fee === 0 ? (
                        <span className="font-medium text-green-600">FREE</span>
                      ) : (
                        formatPrice(selectedOrder.delivery_fee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                <Separator />

                {/* Shipping & Contact Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </h3>
                    <p className="text-sm">
                      {selectedOrder.customer.first_name}{" "}
                      {selectedOrder.customer.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shipping.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shipping.city}
                      {selectedOrder.shipping.postalCode &&
                        `, ${selectedOrder.shipping.postalCode}`}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Phone className="h-4 w-4" />
                      Contact Info
                    </h3>
                    <p className="text-sm">{selectedOrder.customer.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.customer.phone_number}
                    </p>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="mb-2 text-sm font-medium">
                        Delivery Notes
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Button
                onClick={() =>
                  navigate(`/order-confirmation/${selectedOrder.id}`)
                }
                size="sm"
                className="flex-1 w-full mt-3 bg-accent text-accent-foreground"
                variant="outline"
              >
                <Eye className="mr-2 h-4 w-4" />
                Order Confirmation
              </Button>
            </PanelBody>
          </SidePanel>
        )}
      </div>
    </Layout>
  );
}
