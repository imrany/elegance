import { ShoppingCart, Eye, Filter, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";

export const ProductListingPage = () => {
  const { data: products, isLoading } = useProducts();

  if (!products) {
    return (
      <Layout>
        <div className="container py-32">
          <div className="mx-auto max-w-md text-center">
            <h1 className="mt-6 font-serif text-2xl font-light text-foreground">
              No Product added yet
            </h1>
            <p className="mt-2 text-muted-foreground">Try again later</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin w-8 h-8 text-accent" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
        {/* Responsive Product Grid */}
        {!isLoading && products && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className={`animate-fade-up shadow-none delay-${((index % 4) + 1) * 100}`}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
