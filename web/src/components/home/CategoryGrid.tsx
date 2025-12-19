import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

import categoryWomen from "@/assets/category-women.jpg";
import categoryMen from "@/assets/category-men.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const categoryImages: Record<string, string> = {
  women: categoryWomen,
  men: categoryMen,
  accessories: categoryAccessories,
};

export function CategoryGrid() {
  const { isAdmin } = useAuth();
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-none" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Filter to show main categories (not new arrivals for this grid)
  const mainCategories = categories?.filter(
    (cat) => cat.slug !== "new-arrivals",
  );

  return (
    <section className="py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Shop by Category
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-accent" />
        </div>

        {mainCategories ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mainCategories.slice(0, 3).map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                className={index === 0 ? "md:row-span-2 lg:row-span-1" : ""}
              />
            ))}
          </div>
        ) : (
          isAdmin && (
            <div className="flex items-center justify-center w-full">
              <Link
                to="/admin/products"
                className="font-medium text-lg tracking-wide text-accent transition-colors hover:text-accent/80"
              >
                + [Add new product category]
              </Link>
            </div>
          )
        )}
      </div>
    </section>
  );
}

interface CategoryCardProps {
  category: Category;
  className?: string;
}

function CategoryCard({ category, className = "" }: CategoryCardProps) {
  const imageUrl =
    category.image_url || categoryImages[category.slug] || categoryWomen;

  return (
    <Link
      to={`/category/${category.slug}`}
      className={`group relative block aspect-[3/4] overflow-hidden ${className}`}
    >
      <img
        src={imageUrl}
        alt={category.name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
        <h3 className="font-serif text-2xl font-light tracking-wide text-primary-foreground md:text-3xl">
          {category.name}
        </h3>
        <p className="mt-2 text-sm text-primary-foreground/70">
          {category.description}
        </p>
        <span className="mt-4 text-sm font-medium tracking-luxury uppercase text-accent">
          Shop Now
        </span>
      </div>
    </Link>
  );
}
