import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { useEffect } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();

  const FREE_SHIPPING_THRESHOLD = 10000;
  const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 500;
  const total = subtotal + deliveryFee;

  // Calculate total number of structural item units in the cart
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const remainderToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  useEffect(() => {
    window.scrollTo({
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
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/60" />
            <h1 className="mt-6 font-serif text-2xl font-light text-foreground">
              Your cart is empty
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover our collection and add some items to your cart.
            </p>
            <Button asChild className="mt-6 rounded-none">
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
          Shopping Cart
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="divide-y divide-border rounded border border-border bg-background shadow-sm">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size || "none"}-${item.color || "none"}`}
                  className="flex gap-4 p-4 sm:p-6 transition-all duration-200"
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-secondary sm:h-32 sm:w-32 border border-border/40">
                    <img
                      src={item.product.images?.[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-sm font-medium text-foreground line-clamp-2">
                          <Link
                            to={`/products/${item.product.slug}`}
                            className="hover:text-accent transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        {(item.size || item.color) && (
                          <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && "  |  "}
                            {item.color && `Color: ${item.color}`}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      {/* Quantity Selector Engine */}
                      <div className="flex items-center border border-border h-9 bg-background">
                        <Button
                          variant="outline"
                          className="px-2.5 h-full transition-colors hover:bg-muted disabled:opacity-40"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                              item.size,
                              item.color,
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          className="px-2.5 h-full transition-colors hover:bg-muted disabled:opacity-40"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                              item.size,
                              item.color,
                            )
                          }
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Deletion Interface */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-9 px-3 rounded-none"
                        onClick={() =>
                          removeItem(item.product.id, item.size, item.color)
                        }
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        <span className="text-xs font-medium hidden sm:inline">
                          Remove
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-none border-border hover:bg-muted text-xs font-medium tracking-wide uppercase transition-colors"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>

          {/* Checkout Order Summary Container */}
          <div className="lg:col-span-1">
            <div className="rounded border border-border bg-secondary/20 p-6 shadow-sm space-y-6">
              <h2 className="font-serif text-lg font-medium text-foreground">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({totalItemsCount}{" "}
                    {totalItemsCount === 1 ? "item" : "items"})
                  </span>
                  <span className="font-medium text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium text-foreground">
                    {deliveryFee === 0 ? (
                      <span className="text-xs font-semibold text-emerald-600 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-sm">
                        FREE
                      </span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>

                {/* Free Delivery dynamic contextual indicator banners */}
                {deliveryFee > 0 ? (
                  <div className="bg-background border border-border/60 p-3 rounded-sm text-center">
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Add{" "}
                      <span className="font-semibold text-foreground">
                        {formatPrice(remainderToFreeShipping)}
                      </span>{" "}
                      more to unlock{" "}
                      <span className="text-emerald-600 font-medium">
                        Free Shipping
                      </span>
                      .
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-sm text-center">
                    <p className="text-[11px] text-emerald-700 font-medium leading-normal">
                      Your order qualifies for free delivery!
                    </p>
                  </div>
                )}

                <hr className="border-border" />

                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-foreground">
                    Estimated Total
                  </span>
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Button
                asChild
                className="w-full rounded-none py-6 text-xs font-semibold uppercase tracking-widest transition-all"
                size="lg"
              >
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>

              <p className="text-center text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Secure checkout integrated with M-Pesa
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
