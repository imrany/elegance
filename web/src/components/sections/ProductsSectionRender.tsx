import { ProductsSectionData } from "@/lib/page-types";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export function ProductsSectionRenderer({
  data,
}: {
  data: ProductsSectionData;
}) {
  const { data: products, isLoading } = useQuery({
    queryKey: [
      "products",
      data.display_type,
      data.category_id,
      data.product_ids,
    ],
    queryFn: async () => {
      // Fetch products based on display_type
      const response = await api.getProducts({
        featured: data.display_type === "featured",
        category: data.category_id,
        limit: data.limit,
      });
      return response;
    },
  });

  if (isLoading) {
    return (
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: data.background_color }}
      >
        <div className="container">
          <div className="text-center">Loading products...</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: data.background_color }}
    >
      <div className="container">
        {/* Header */}
        <div className="text-center">
          {data.subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              {data.subtitle}
            </p>
          )}
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            {data.title}
          </h2>
        </div>

        {/* Products Grid */}
        <div
          className={`mt-12 grid gap-6 md:grid-cols-${data.columns}`}
          style={{
            gridTemplateColumns: `repeat(${data.columns}, minmax(0, 1fr))`,
          }}
        >
          {products?.slice(0, data.limit).map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
            >
              <a href={`/products/${product.slug}`}>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-64 w-full object-cover transition-transform group-hover:scale-105"
                />
              </a>
              <div className="p-4">
                <a href={`/products/${product.slug}`}>
                  <h3 className="text-lg font-semibold text-foreground hover:text-accent">
                    {product.name}
                  </h3>
                </a>
                {data.show_price && (
                  <p className="mt-2 text-xl font-bold text-accent">
                    ${product.price.toFixed(2)}
                  </p>
                )}
                {data.show_add_to_cart && (
                  <Button className="mt-4 w-full" size="sm">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
