import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { api, Order } from "@/lib/api";
import {
  CheckCircle2,
  ArrowLeft,
  Package,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGeneralContext } from "@/contexts/GeneralContext";

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const { websiteConfig } = useGeneralContext();
  const mpesa = websiteConfig?.mpesa;

  // Fetch order details
  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const orders = await api.getOrders("id", orderId!);
      return orders[0];
    },
    enabled: !!orderId,
    refetchInterval: 5000, // Refetch every 5 seconds to check payment status
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Countdown for M-Pesa prompt
  useEffect(() => {
    if (order?.payment_status === "pending") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order?.payment_status]);

  // Format date
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      processing: { variant: "default", label: "Processing" },
      shipped: { variant: "default", label: "Shipped" },
      delivered: { variant: "default", label: "Delivered" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    return variants[status] || { variant: "secondary", label: status };
  };

  // Get payment status badge
  const getPaymentBadge = (status: string) => {
    const variants: Record<
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { variant: any; label: string; color: string }
    > = {
      pending: {
        variant: "secondary",
        label: "Payment Pending",
        color: "text-yellow-600",
      },
      completed: { variant: "default", label: "Paid", color: "text-green-600" },
      failed: {
        variant: "destructive",
        label: "Payment Failed",
        color: "text-red-600",
      },
    };
    return (
      variants[status] || { variant: "secondary", label: status, color: "" }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" />
            <p className="mt-4 text-muted-foreground">
              Loading order details...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container py-12">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-center">Order Not Found</CardTitle>
              <CardDescription className="text-center">
                We couldn't find the order you're looking for.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const statusBadge = getStatusBadge(order.status);
  const paymentBadge = getPaymentBadge(order.payment_status);

  return (
    <Layout>
      <div className="container py-12">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your order. We've received your request.
          </p>
        </div>

        {/* M-Pesa Payment Alert */}
        {order.payment_status === "pending" && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
            <CreditCard className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-900 dark:text-yellow-100">
              Complete Your Payment
            </AlertTitle>
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <p className="mb-2">
                An M-Pesa payment prompt has been sent to{" "}
                <strong>{order.customer.phone_number}</strong>
              </p>
              <p className="text-sm">
                Please enter your M-Pesa PIN to complete the payment within{" "}
                <strong>{countdown} seconds</strong>
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Success Alert */}
        {order.payment_status === "paid" && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">
              Payment Successful
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              Your payment has been received. We'll start processing your order
              shortly.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Failed Alert */}
        {order.payment_status === "failed" && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Failed</AlertTitle>
            <AlertDescription>
              Your payment could not be processed. Please contact support with
              your order ID.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order #{order.id?.substring(0, 8)}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(order.created_at)}
                    </CardDescription>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                    <Badge
                      variant={paymentBadge.variant}
                      className={paymentBadge.color}
                    >
                      {paymentBadge.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div>
                  <h3 className="mb-3 font-medium text-foreground">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-border bg-secondary">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                            {item.size && ` · Size: ${item.size}`}
                            {item.color && ` · Color: ${item.color}`}
                          </p>
                          <p className="mt-1 font-medium text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="text-foreground">
                      {order.delivery_fee === 0 ? (
                        <span className="font-medium text-green-600">FREE</span>
                      ) : (
                        formatPrice(order.delivery_fee)
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Delivery Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">
                      {order.customer.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">
                      {order.customer.phone_number}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  {order.customer.first_name} {order.customer.last_name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.shipping.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shipping.city}
                  {order.shipping.postalCode &&
                    `, ${order.shipping.postalCode}`}
                </p>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-medium">M-Pesa</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer.phone_number}
                    </p>
                  </div>
                  {mpesa && (
                    <div className="flex flex-col justify-center items-start gap-2 ml-auto">
                      {mpesa.type === "till" ? (
                        <p className="text-sm text-green-600">
                          Till Number:{" "}
                          <span className="text-foreground">
                            {mpesa.till_number}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-green-600">
                          Paybill Number:{" "}
                          <span className="text-foreground">
                            {mpesa.paybill_number}
                          </span>
                        </p>
                      )}
                      <p className="text-sm text-green-600">
                        M-Pesa No:{" "}
                        <span className="text-foreground">{mpesa.phone}</span>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
              <Button
                onClick={() => window.print()}
                className="w-full"
                variant="outline"
              >
                Print Order
              </Button>
            </div>

            {/* Support */}
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Need help with your order?
                </p>
                <Button asChild variant="link" className="mt-2 h-auto p-0">
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
