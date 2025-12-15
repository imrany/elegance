import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  ChevronDown,
  MoreVerticalIcon,
  Phone,
  MapPin,
  Trash2Icon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatPrice,
  formatShortDate,
  getPaymentBadge,
  getStatusBadge,
  statusColors,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import SidePanel, {
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelBody,
  PanelClose,
} from "@/components/common/SidePanel";
import { Separator } from "@/components/ui/separator";

export default function OrdersAdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSelectedOrder, setIsSelectedOrder] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      const { data } = await api.updateOrderStatus(id, updatePayload);
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

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.deleteOrder(id);
      if (!data) throw new Error("Failed to delete order");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteOrder = (id: string) => {
    deleteOrderMutation.mutate(id);
  };

  const filteredOrders =
    orders?.filter((order) => {
      const matchesSearch =
        order.customer.first_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        order.customer.last_name.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-muted-foreground">Manage customer orders</p>
      </div>

      {/* Filters */}
      {!isLoading && orders && (
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
      )}

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
                      <span className="font-mono text-sm text-muted-foreground">
                        #{order.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {order.customer.first_name} {order.customer.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer.email}
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
                          onClick={() => {
                            setIsSelectedOrder(!isSelectedOrder);
                            setSelectedOrder(order);
                          }}
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
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

      {/* Order Details Panel */}
      {selectedOrder && (
        <>
          <SidePanel isOpen={isSelectedOrder} onOpenChange={setIsSelectedOrder}>
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

                {/*delete order*/}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setIsSelectedOrder(false);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete Order
                </Button>
              </div>
            </PanelBody>
          </SidePanel>

          {/* Delete order Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Order</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this order? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm">
                    <strong>Order ID:</strong> {selectedOrder?.id}
                  </p>
                  <p className="text-sm mt-2">
                    All data associated with this order will be deleted from the
                    system.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={deleteOrderMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteOrder(selectedOrder?.id)}
                  disabled={deleteOrderMutation.isPending}
                >
                  {deleteOrderMutation.isPending
                    ? "Deleting..."
                    : "Delete Order"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
