import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, formatPrice } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  return (
    <article className={cn("group", className)}>
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.is_new && (
              <span className="bg-accent px-3 py-1 text-xs font-medium tracking-wide text-accent-foreground">
                NEW
              </span>
            )}
            {hasDiscount && (
              <span className="bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Add to wishlist
              }}
            >
              <Heart className="h-4 w-4" />
              <span className="sr-only">Add to wishlist</span>
            </Button>
          </div>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
            <Button
              className="w-full rounded-none bg-primary/90 py-6 text-sm font-medium tracking-wide text-primary-foreground backdrop-blur-sm hover:bg-primary"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Quick add to cart
              }}
            >
              Add to Bag
            </Button>
          </div>
        </div>

        {/* Product info */}
        <div className="mt-4 space-y-2">
          <h3 className="font-serif text-lg font-medium text-foreground transition-colors group-hover:text-accent">
            {product.name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-foreground">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.original_price!)}
              </span>
            )}
          </div>
          {product.colors.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {product.colors.length} {product.colors.length === 1 ? "color" : "colors"}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
