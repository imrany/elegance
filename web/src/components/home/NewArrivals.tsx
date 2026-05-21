import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function NewArrivals() {
  const { isAdmin } = useAuth();

  // Removed hardcoded limit: 4 to fetch the complete new arrivals collection array
  const { data: products, isLoading } = useProducts({ is_new: true }, ["new"]);

  const arrivalProducts = products || [];
  const showCarousel = arrivalProducts.length > 4;

  return (
    <section className="py-20 overflow-hidden">
      <div className="container px-4 sm:px-12">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium tracking-luxury uppercase text-accent">
              Just Landed
            </p>
            <h2 className="mt-2 font-serif text-3xl font-light text-foreground md:text-4xl">
              New Arrivals
            </h2>
          </div>
          <Button
            asChild
            variant="ghost"
            className="group gap-2 text-foreground hover:text-foreground"
          >
            {arrivalProducts.length > 0 && (
              <Link to="/category/new-arrivals">
                View All
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </Button>
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
        ) : arrivalProducts.length > 0 ? (
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
                  {arrivalProducts.map((product) => (
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
              {arrivalProducts.map((product, index) => (
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
                className="font-medium text-sm uppercase tracking-wider text-accent transition-colors hover:text-accent/80 border border-dashed border-border p-6 w-full text-center max-w-md bg-secondary/10"
              >
                + Create new product arrivals
              </Link>
            </div>
          )
        )}
      </div>
    </section>
  );
}
