import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function FeaturedProducts() {
  const { isAdmin } = useAuth();

  // Removed hardcoded limit: 4 to fetch the complete featured collection array
  const { data: products, isLoading } = useProducts(
    {
      featured: true,
    },
    ["featured"],
  );

  const featuredProducts = products || [];
  const showCarousel = featuredProducts.length > 4;

  return (
    <section className="bg-secondary/50 py-20 overflow-hidden">
      <div className="container px-4 sm:px-12">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium tracking-luxury uppercase text-accent">
            Curated Selection
          </p>
          <h2 className="mt-2 font-serif text-3xl font-light text-foreground md:text-4xl">
            Featured Collection
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-accent" />
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] rounded-none" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          showCarousel ? (
            /* Carousel Frame Setup Layer */
            <div className="relative w-full md:px-4">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 3000,
                    stopOnInteraction: false,
                    stopOnMouseEnter: true,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {featuredProducts.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Isolated Navigation Controls Layers */}
                <div className="hidden sm:block">
                  <CarouselPrevious
                    className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-none border-border bg-background hover:bg-muted transition-colors shadow-sm z-20"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <CarouselNext
                    className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-none border-border bg-background hover:bg-muted transition-colors shadow-sm z-20"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </Carousel>
            </div>
          ) : (
            /* Standard Grid Fallback Matrix Frame (4 or fewer items) */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className={`animate-fade-up delay-${(index + 1) * 100}`}
                />
              ))}
            </div>
          )
        ) : (
          isAdmin && (
            <div className="flex items-center justify-center w-full py-8">
              <Link
                to="/admin/products"
                className="font-medium text-sm uppercase tracking-wider text-accent transition-colors hover:text-accent/80 border border-dashed border-border p-6 w-full text-center max-w-md bg-background"
              >
                + Add New Featured Collection
              </Link>
            </div>
          )
        )}
      </div>
    </section>
  );
}
