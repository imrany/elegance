import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Eye, ChevronDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api, Order } from "@/lib/api";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-blue-500/10 text-blue-600",
  shipped: "bg-purple-500/10 text-purple-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-600",
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await api.getAllOrders();
      if (!data) throw new Error("Failed to fetch orders");
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.updateOrderStatus(id, {
        status,
        payment_status: status === "cancelled" ? "cancelled" : "paid",
      });
      if (!data) throw new Error("Failed to update order status");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-muted-foreground">Manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredOrders?.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {order.customer_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
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
                          {[
                            "pending",
                            "processing",
                            "shipped",
                            "delivered",
                            "cancelled",
                          ].map((status) => (
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
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium text-foreground">
                  Customer Details
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {selectedOrder.customer_name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {selectedOrder.customer_email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    {selectedOrder.customer_phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Address:</span>{" "}
                    {selectedOrder.delivery_address}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium text-foreground">Order Items</h3>
                <div className="mt-2 divide-y divide-border">
                  {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between py-2 text-sm"
                    >
                      <span>
                        {item.name} × {item.quantity}
                        {item.size && ` (${item.size})`}
                        {item.color && ` - ${item.color}`}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-medium text-foreground">Order Summary</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {selectedOrder.delivery_fee === 0
                        ? "FREE"
                        : formatPrice(selectedOrder.delivery_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-medium">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-medium text-foreground">Notes</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
