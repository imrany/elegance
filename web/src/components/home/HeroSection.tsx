import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-kenyan-fashion.jpg";
import { useSiteSetting } from "@/hooks/useSiteSetting";
import { Skeleton } from "../ui/skeleton";
import { useGeneralContext } from "@/contexts/GeneralContext";

export function HeroSection() {
  const { websiteConfig, categories } = useGeneralContext();
  const hero = websiteConfig?.hero;
  console.log(hero);
  const currentYear = new Date().getFullYear();
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

  // Use optional chaining for 'value' as well, in case 'setting' is null or 'value' property is missing
  const siteName = value?.["name"] || "[Your Store Name]";
  const siteDescription = value?.["description"] || "[Your Store Description]";
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-secondary">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={hero.background_image || heroImage}
          alt="Hero Background Image"
          className="h-full w-full object-cover"
        />
        {hero.overlay && hero.background_image && (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: hero.overlay_opacity || 0.5 }}
          />
        )}
      </div>

      {!isLoading && (
        <>
          {/* Content */}
          <div className="container relative flex min-h-[90vh] items-center py-20">
            <div className="max-w-xl animate-fade-up space-y-8">
              <p className="text-sm font-medium tracking-luxury uppercase text-accent">
                New Collection {currentYear}
              </p>
              <h1 className="font-serif text-5xl font-light leading-tight text-primary-foreground md:text-6xl lg:text-7xl">
                {hero.title || siteName}
                <br />
                <span className="font-semibold italic">
                  {siteDescription
                    ? `${hero.subtitle.slice(0, 9)}...`
                    : "Redefined"}
                </span>
              </h1>

              <p className="text-lg leading-relaxed text-primary-foreground/80">
                {siteDescription ? siteDescription : hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="group gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Link
                    to={hero.cta_link || `/category/${categories[0].slug}`}
                    className="capitalize"
                  >
                    {hero.cta_text || `Shop ${categories[0].name}`}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                {categories && categories.length > 1 && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link
                      to={`/category/${categories[1].slug}`}
                      className="capitalize"
                    >
                      Shop {categories[1].name}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-primary-foreground/60">
              <span className="text-xs tracking-luxury uppercase">Scroll</span>
              <div className="h-12 w-px bg-primary-foreground/30" />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
