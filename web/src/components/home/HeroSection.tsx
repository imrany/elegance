import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-kenyan-fashion.jpg";

export function HeroSection() {
  const currentYear = new Date().getFullYear()
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-secondary">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Kenyan woman in luxury fashion"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative flex min-h-[90vh] items-center py-20">
        <div className="max-w-xl animate-fade-up space-y-8">
          <p className="text-sm font-medium tracking-luxury uppercase text-accent">
            New Collection {currentYear}
          </p>
          <h1 className="font-serif text-5xl font-light leading-tight text-primary-foreground md:text-6xl lg:text-7xl">
            Elegance
            <br />
            <span className="font-semibold italic">Redefined</span>
          </h1>
          <p className="text-lg leading-relaxed text-primary-foreground/80">
            Discover our curated collection of luxury fashion, crafted for the
            modern Kenyan who appreciates timeless sophistication.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="group gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/category/women">
                Shop Women
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link to="/category/men">Shop Men</Link>
            </Button>
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
    </section>
  );
}
