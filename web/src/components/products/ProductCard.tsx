import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasDiscount =
    product.original_price && product.original_price > product.price;
  const isOutOfStock = product.stock <= 0;

  // Gather images array or fallback to placeholder safely
  const productImages = product.images?.length
    ? product.images
    : ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"];

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn(
        "group block w-full",
        isOutOfStock && "opacity-80",
        className,
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted rounded-md">
        {/* Core Media Render Engine */}
        <img
          src={productImages[currentImageIndex]}
          alt={`${product.name} - View ${currentImageIndex + 1}`}
          className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Dynamic Multi-Image Slide Controllers (Hover Triggers) */}
        {productImages.length > 1 && !isOutOfStock && (
          <div className="absolute inset-0 z-10 flex">
            {productImages.map((_, index) => (
              <div
                key={index}
                className="h-full flex-1"
                onMouseEnter={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}

        {/* Navigation Indicator Bar Segment */}
        {productImages.length > 1 && !isOutOfStock && (
          <div className="absolute bottom-3 left-1/2 z-20 flex w-11/12 -translate-x-1/2 gap-1 px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {productImages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  index === currentImageIndex
                    ? "bg-foreground shadow-sm scale-y-110"
                    : "bg-foreground/20 backdrop-blur-sm",
                )}
              />
            ))}
          </div>
        )}

        {/* Absolute Floating Badges Layer */}
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          {product.is_new && !isOutOfStock && (
            <span className="bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground shadow-sm rounded-sm">
              New
            </span>
          )}
          {hasDiscount && !isOutOfStock && (
            <span className="bg-destructive px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground shadow-sm rounded-sm">
              Sale
            </span>
          )}
        </div>

        {/* Global Inventory Guard State Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
            <span className="bg-background/90 border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground shadow-sm rounded-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Meta Identity Data Fields */}
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/60">
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
