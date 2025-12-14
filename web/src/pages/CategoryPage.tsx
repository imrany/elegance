import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useEffect } from "react";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch categories
  const { data: categories, error } = useCategories();

  const category = categories?.find((cat) => cat.slug === slug);

  const { data: products, isLoading } = useProducts({
    is_new: slug === "new-arrivals" && "true",
    category_id: category?.id || undefined,
  });

  useEffect(() => {
    scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);
  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-secondary py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-luxury uppercase text-accent">
              Collection
            </p>
            <h1 className="mt-4 font-serif text-4xl font-light text-foreground md:text-5xl">
              {category?.name ||
                slug
                  ?.replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
            </h1>
            {category?.description && (
              <p className="mt-4 text-lg text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${products?.length || 0} products`}
            </p>
            {/* TODO: Add filters and sort */}
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] rounded-none" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className={`animate-fade-up delay-${((index % 4) + 1) * 100}`}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
