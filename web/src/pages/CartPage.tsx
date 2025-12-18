import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { useEffect } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  const deliveryFee = subtotal >= 10000 ? 0 : 500;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);
  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="mx-auto max-w-md text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-6 font-serif text-2xl font-light text-foreground">
              Your cart is empty
            </h1>
            <p className="mt-2 text-muted-foreground">
              Discover our collection and add some items to your cart.
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-serif text-3xl font-light text-foreground md:text-4xl">
          Shopping Cart
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-border rounded-lg border border-border">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex gap-4 p-4 sm:p-6"
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-secondary sm:h-32 sm:w-32">
                    <img
                      src={item.product.images?.[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="hover:text-accent"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        {(item.size || item.color) && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && " · "}
                            {item.color && `Color: ${item.color}`}
                          </p>
                        )}
                      </div>
                      <p className="font-medium text-foreground">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.size,
                              item.color,
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.size,
                              item.color,
                            )
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          removeItem(item.product.id, item.size, item.color)
                        }
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        <p className="hidden md:inline">Remove</p>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-4" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-border bg-secondary/30 p-6">
              <h2 className="font-serif text-xl font-medium text-foreground">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">
                    {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Free delivery on orders over {formatPrice(10000)}
                  </p>
                )}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between font-medium">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Button asChild className="mt-6 w-full" size="lg">
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Secure checkout powered by M-Pesa
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
