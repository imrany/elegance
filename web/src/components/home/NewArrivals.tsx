import { Link } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

export function NewArrivals() {
  const { data: products, isLoading } = useProducts(
    { is_new: true, limit: 4 },
    ["new"],
  );

  return (
    <section className="py-20">
      <div className="container">
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
            <Link to="/category/new-arrivals">
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
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
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products?.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className={`animate-fade-up delay-${(index + 1) * 100}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
