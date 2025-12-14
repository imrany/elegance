import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const hasDiscount =
    product.original_price && product.original_price > product.price;

  return (
    <Link
      to={`/product/${product.slug}`}
      className={cn("group card-luxury block", className)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={
            product.images?.[0] ||
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
          }
          alt={product.name}
          className="img-zoom h-full w-full object-cover"
        />
        {product.is_new && (
          <span className="absolute left-4 top-4 bg-accent px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent-foreground">
            New
          </span>
        )}
        {hasDiscount && (
          <span className="absolute right-4 top-4 bg-destructive px-3 py-1 text-xs font-medium uppercase tracking-wide text-destructive-foreground">
            Sale
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="text-base font-medium text-foreground group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
