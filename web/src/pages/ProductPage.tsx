import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Minus, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useProduct } from "@/hooks/useProducts";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useProduct(slug);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <Skeleton className="aspect-[3/4]" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
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
            className="mt-6 text-primary underline hover:text-primary/90"
          >
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const hasDiscount =
    product.original_price && product.original_price > product.price;

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    if (!selectedColor && product.colors && product.colors.length > 0) {
      toast({
        title: "Please select a color",
        variant: "destructive",
      });
      return;
    }
    addItem(
      product,
      quantity,
      selectedSize || undefined,
      selectedColor || undefined,
    );
    toast({
      title: "Added to bag",
      description: `${product.name} has been added to your shopping bag.`,
    });
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            {product.category_id && (
              <>
                <Link
                  to={`/category/${product.category_id}`}
                  className="hover:text-foreground"
                >
                  Category
                </Link>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={
                  product.images?.[selectedImage] ||
                  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
                }
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "aspect-square w-20 overflow-hidden border-2 transition-colors",
                      selectedImage === index
                        ? "border-accent"
                        : "border-transparent",
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="space-y-6">
              {/* Title */}
              <h1 className="font-serif text-3xl font-light text-foreground md:text-4xl">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-2xl font-medium text-foreground">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price!)}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Color:{" "}
                    <span className="text-muted-foreground">
                      {selectedColor || "Select"}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "rounded-none border px-4 py-2 text-sm transition-colors",
                          selectedColor === color
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border hover:border-foreground",
                        )}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Size:{" "}
                    <span className="text-muted-foreground">
                      {selectedSize || "Select"}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "min-w-[48px] rounded-none border px-4 py-2 text-sm transition-colors",
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

              {/* Quantity */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 transition-colors hover:bg-muted"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="p-3 transition-colors hover:bg-muted"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  size="lg"
                  className="flex-1 rounded-none bg-primary py-6 text-sm font-medium tracking-wide text-primary-foreground hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Bag"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-none px-4"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Additional info */}
              <div className="border-t border-border pt-6 text-sm text-muted-foreground">
                <p>Free delivery on orders over KES 10,000</p>
                <p className="mt-1">Easy returns within 14 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
