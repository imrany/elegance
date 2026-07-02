import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Minus, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useProduct } from "@/hooks/useProducts";
import { toast } from "sonner";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(slug);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Use ref to safely manage toast timeouts across unmount lifecycles
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Safeguard: Reset local quantity indices if products shift asynchronously
  useEffect(() => {
    setQuantity(1);
    setSelectedImage(0);
    setSelectedSize(null);
    setSelectedColor(null);
  }, [slug]);

  // Clean up side-effects on component teardown
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <Skeleton className="aspect-[3/4] w-full rounded-md" />
            <div className="space-y-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h1 className="font-serif text-3xl text-foreground">
            Product not found
          </h1>
          <Button
            asChild
            className="mt-6 text-primary-foreground hover:text-primary-foreground rounded-none"
          >
            <Link to="/products">Return to Shop</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const hasDiscount =
    product.original_price && product.original_price > product.price;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast.error("Please select a size preference");
      return;
    }
    if (!selectedColor && product.colors && product.colors.length > 0) {
      toast.error("Please select a color variation");
      return;
    }

    // Pass structural context objects clearly without disrupting arrays
    addItem(
      {
        ...product,
        images:
          selectedImage !== 0
            ? [product.images?.[selectedImage]]
            : [product.images?.[0]],
      },
      quantity,
      selectedSize || undefined,
      selectedColor || undefined,
    );

    const loadingToastId = toast.loading("Item added! Redirecting to cart...", {
      action: {
        label: "Stay Here",
        onClick: () => {
          if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
          }
          toast.dismiss(loadingToastId);
        },
      },
    });

    navigationTimeoutRef.current = setTimeout(() => {
      toast.dismiss(loadingToastId);
      navigate("/cart");
    }, 2000);
  };

  return (
    <Layout>
      {/* Breadcrumbs Section */}
      <div className="container py-4 border-b border-border/40">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            to="/products"
            className="hover:text-foreground transition-colors"
          >
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="container py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Media Presentation Display Matrix */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-md">
              <img
                src={
                  product.images?.[selectedImage] ||
                  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
                }
                alt={product.name}
                className="h-full w-full object-cover transition-all duration-300"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
                  <span className="bg-background/95 border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "aspect-[3/4] w-20 flex-shrink-0 overflow-hidden border-2 rounded-sm transition-all",
                      selectedImage === index
                        ? "border-accent scale-95"
                        : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Meta Specifications & Attributes Block */}
          <div className="lg:sticky lg:top-32 lg:self-start space-y-6">
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-xl font-semibold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-md text-muted-foreground line-through decoration-muted-foreground/60">
                    {formatPrice(product.original_price!)}
                  </span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description.length > 0
                  ? product.description.length > 500
                    ? product.description.substring(0, 500) + "..."
                    : product.description
                  : "No description available."}
              </p>
            )}

            {/* Colors Variant Configurator Component */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Color:{" "}
                  <span className="text-muted-foreground font-normal normal-case ml-1">
                    {selectedColor || "Select option"}
                  </span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "rounded-none border px-4 py-2 text-xs uppercase tracking-wider transition-all",
                        selectedColor === color
                          ? "border-accent bg-accent text-accent-foreground font-medium"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Variant Configurator Component */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Size:{" "}
                  <span className="text-muted-foreground font-normal normal-case ml-1">
                    {selectedSize || "Select option"}
                  </span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "min-w-[44px] rounded-none border px-3 py-2 text-xs font-medium transition-all",
                        selectedSize === size
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory Quantity Step Counter Layer */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground block">
                Quantity
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border h-11 bg-background">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-3 h-full transition-colors hover:bg-muted disabled:opacity-40"
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((prev) => Math.min(product.stock, prev + 1))
                    }
                    className="px-3 h-full transition-colors hover:bg-muted disabled:opacity-40"
                    disabled={quantity >= product.stock || isOutOfStock}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {!isOutOfStock
                    ? `${product.stock} items available`
                    : "Discontinued or out of stock"}
                </span>
              </div>
            </div>

            {/* CTA Execution Elements Panel */}
            <div className="flex gap-4 pt-2">
              <Button
                size="lg"
                className="flex-1 rounded-none bg-primary py-6 text-xs uppercase tracking-widest font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-none px-4 border-border hover:bg-muted transition-colors h-[52px]"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <hr className="border-border" />

            {/* Logistics Disclaimers Footer */}
            <div className="space-y-1.5 text-xs text-muted-foreground tracking-wide">
              <p className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-accent" />
                Free delivery on orders over KES 10,000
              </p>
              <p className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-accent" />
                Easy returns within 14 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
