import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

  const mainCategories =
    categories?.filter((cat) => cat.slug !== "new-arrivals") || [];

  const showCarousel = mainCategories.length > 3;

  return (
    <section className="py-20 overflow-hidden">
      {/* Container wrapper handles responsive padding layout metrics */}
      <div className="container px-4 sm:px-12">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Shop by Category
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-accent" />
        </div>

        {mainCategories.length > 0 ? (
          showCarousel ? (
            /* Explicit relative wrapper isolate positioning layout bounds */
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
                  {mainCategories.map((category) => (
                    <CarouselItem
                      key={category.id}
                      className="pl-4 md:basis-1/2 lg:basis-1/3"
                    >
                      <CategoryCard category={category} />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Arrow Navigation Elements Rendered Completely Independent of Card Link Flow */}
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mainCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
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
                + Create new product category
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
      className={`group relative block aspect-[3/4] overflow-hidden border border-border/10 ${className}`}
    >
      <img
        src={imageUrl}
        alt={category.name}
        className="h-full w-full object-cover transition-transform duration-750 ease-out group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />

      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 sm:p-8 text-center z-10">
        <h3 className="font-serif text-2xl font-light tracking-wide text-white md:text-3xl">
          {category.name}
        </h3>
        {category.description && (
          <p className="mt-2 text-xs text-white/70 max-w-[240px] line-clamp-2">
            {category.description}
          </p>
        )}
        <span className="mt-4 text-[11px] font-semibold tracking-widest uppercase text-accent border-b border-accent/0 group-hover:border-accent/100 transition-all pb-0.5">
          Shop Now
        </span>
      </div>
    </Link>
  );
}
