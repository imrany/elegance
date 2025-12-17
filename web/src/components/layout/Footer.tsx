import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeneralContext } from "@/contexts/GeneralContext";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { categories, websiteConfig } = useGeneralContext();
  const socialMedia = websiteConfig?.social;
  const store = websiteConfig.store;

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl tracking-elegant">
              {store.name}
            </h2>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              {store.description}
            </p>

            <div className="flex gap-4">
              {socialMedia?.["twitter"] && (
                <a
                  href={socialMedia?.["twitter"]}
                  className="text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.["instagram"] && (
                <a
                  href={socialMedia?.["instagram"]}
                  className="text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.["facebook"] && (
                <a
                  href={socialMedia?.["facebook"]}
                  className="text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.["linkedin"] && (
                <a
                  href={socialMedia?.["linkedin"]}
                  className="text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.["youtube"] && (
                <a
                  href={socialMedia?.["youtube"]}
                  className="text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.["tiktok"] && (
                <a
                  href={socialMedia?.["tiktok"]}
                  className="text-primary-foreground/70 transition-colors hover:text-accent"
                >
                  <Link2 className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          {categories && (
            <div className="space-y-6">
              <h3 className="text-sm font-medium tracking-luxury uppercase">
                Shop
              </h3>
              <nav className="flex flex-col gap-3">
                {categories
                  .slice(0, 4)
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime(),
                  )
                  .map((category) => (
                    <Link
                      key={category.slug}
                      to={`/category/${category.slug}`}
                      className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
                    >
                      {category.name}
                    </Link>
                  ))}
              </nav>
            </div>
          )}

          {/* Help */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium tracking-luxury uppercase">
              Help
            </h3>
            <nav className="flex flex-col gap-3">
              <Link
                to="#"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
              >
                Contact Us
              </Link>
              <Link
                to="#"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
              >
                Shipping & Returns
              </Link>
              <Link
                to="#"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
              >
                Size Guide
              </Link>
              <Link
                to="#"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
              >
                FAQs
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium tracking-luxury uppercase">
              Newsletter
            </h3>
            <p className="text-sm text-primary-foreground/70">
              Subscribe for exclusive offers and style inspiration.
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button
                variant="outline"
                className="border-primary-foreground/30 hover:bg-primary-foreground hover:text-primary text-primary"
              >
                Join
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 md:flex-row">
          <p className="text-xs text-primary-foreground/50">
            © {currentYear} {store.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="#"
              className="text-xs text-primary-foreground/50 hover:text-primary-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className="text-xs text-primary-foreground/50 hover:text-primary-foreground"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
