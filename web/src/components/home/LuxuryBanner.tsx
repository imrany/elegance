import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteSetting } from "@/hooks/useSiteSetting";
import { Skeleton } from "../ui/skeleton";

export function LuxuryBanner() {
  const { data: setting, isLoading } = useSiteSetting("store");
  const value = (() => {
    if (typeof setting?.value === "string" && setting) {
      try {
        return JSON.parse(setting?.value);
      } catch (e) {
        console.error("Error parsing store settings value:", e);
        return null;
      }
    }
    return null;
  })();
  const siteName = value?.["name"] || "[Your Store Name]";

  return (
    <section className="relative overflow-hidden bg-primary py-24">
      {/* Decorative elements */}
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          {isLoading ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            <p className="text-sm font-medium tracking-luxury uppercase text-accent">
              The {siteName} Promise
            </p>
          )}
          <h2 className="mt-6 font-serif text-3xl font-light leading-relaxed text-primary-foreground md:text-4xl lg:text-5xl">
            "Crafted with passion, worn with confidence"
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-primary-foreground/70">
            Every piece in our collection is carefully selected to bring you
            unparalleled quality and timeless style. Experience luxury fashion
            that celebrates the modern Kenyan spirit.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/category/women">Explore Collection</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
