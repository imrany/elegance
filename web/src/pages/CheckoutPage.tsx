import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { api, Order } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useGeneralContext } from "@/contexts/GeneralContext";

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

const CHECKOUT_CACHE_KEY = "checkout_form_data";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { websiteConfig } = useGeneralContext();
  const mpesa = websiteConfig?.mpesa;

  // Get cached form data
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CHECKOUT_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error reading checkout cache:", error);
      return null;
    }
  };

  const cachedData = getCachedData();

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: user?.first_name || cachedData?.firstName || "",
    lastName: user?.last_name || cachedData?.lastName || "",
    email: user?.email || cachedData?.email || "",
    phone: user?.phone_number || cachedData?.phone || "",
    address: cachedData?.address || "",
    city: cachedData?.city || "",
    postalCode: cachedData?.postalCode || "",
    notes: cachedData?.notes || "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = subtotal >= 10000 ? 0 : 500;
  const total = subtotal + deliveryFee;

  // Save form data to cache
  useEffect(() => {
    try {
      localStorage.setItem(CHECKOUT_CACHE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error("Error saving checkout cache:", error);
    }
  }, [formData]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items.length, navigate]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Clear cache on successful order
  const clearCache = () => {
    try {
      localStorage.removeItem(CHECKOUT_CACHE_KEY);
    } catch (error) {
      console.error("Error clearing checkout cache:", error);
    }
  };

  // Create order mutation
  const createOrderMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (orderData: any) => {
      const response = await api.createOrder(orderData);
      return response;
    },
    onSuccess: (data) => {
      toast.success("Order placed successfully!");
      clearCache();
      clearCart();
      navigate(`/order-confirmation/${data.id}`);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.message || "Failed to place order");
      setIsProcessing(false);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Valid email is required");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    // Validate Kenyan phone number format
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid Kenyan phone number");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    // Format phone number for M-Pesa (254XXXXXXXXX)
    let phone = formData.phone.replace(/\s/g, "");
    if (phone.startsWith("0")) {
      phone = "254" + phone.substring(1);
    } else if (phone.startsWith("+254")) {
      phone = phone.substring(1);
    } else if (!phone.startsWith("254")) {
      phone = "254" + phone;
    }

    const orderData: Order = {
      status: "pending",
      id: null,
      customer: {
        user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: phone,
      },
      shipping: {
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
      },
      items: items.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.product.images?.[0],
      })),
      subtotal,
      delivery_fee: deliveryFee,
      total,
      notes: formData.notes,
      payment_method: "mpesa",
      payment_status: "pending",
      created_at: null,
      updated_at: null,
    };

    createOrderMutation.mutate(orderData);
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Link>
          </Button>
          <h1 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Checkout
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                  <CardDescription>Enter your contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="you@example.com"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (M-Pesa) *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="0712345678 or 254712345678"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      M-Pesa payment prompt will be sent to this number
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                  <CardDescription>
                    Where should we deliver your order?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apartment 4B"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Nairobi"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="00100"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any special delivery instructions..."
                      disabled={isProcessing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-primary/5 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-primary-foreground">
                      M
                    </div>
                    <div>
                      <p className="font-medium text-green-600">M-Pesa</p>
                      <p className="text-sm text-foreground">
                        Secure mobile payment
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
                  <p className="mt-3 text-xs text-muted-foreground">
                    You'll receive an M-Pesa prompt on your phone to complete
                    the payment.
                  </p>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>Place Order · {formatPrice(total)}</>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items List */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.size}-${item.color}`}
                        className="flex gap-3"
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-border bg-secondary">
                          <img
                            src={item.product.images?.[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="font-medium text-foreground">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                            {item.size && ` · ${item.size}`}
                            {item.color && ` · ${item.color}`}
                          </p>
                          <p className="mt-1 font-medium text-foreground">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-foreground">
                        {deliveryFee === 0 ? (
                          <span className="font-medium text-green-600">
                            FREE
                          </span>
                        ) : (
                          formatPrice(deliveryFee)
                        )}
                      </span>
                    </div>
                    {deliveryFee > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Free delivery on orders over {formatPrice(10000)}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      🔒 Secure checkout powered by M-Pesa. Your payment
                      information is encrypted and secure.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
