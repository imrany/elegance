import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";

export function FeaturedProducts() {
  const { data: products, isLoading } = useProducts(
    {
      featured: true,
      limit: 4,
    },
    ["featured"],
  );

  return (
    <section className="bg-secondary/50 py-20">
      <div className="container">
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
