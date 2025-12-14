import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteSetting } from "@/hooks/useSiteSetting";
import { Skeleton } from "../ui/skeleton";
import { SiteSetting } from "@/lib/api";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const { data: store, isLoading: storeLoading } = useSiteSetting("store");
  const { data: socialMedia, isLoading: socialMediaLoading } =
    useSiteSetting("social_media");
  const value = (setting: SiteSetting) => {
    if (typeof setting?.value === "string" && setting) {
      try {
        return JSON.parse(setting?.value);
      } catch (e) {
        console.error("Error parsing store settings value:", e);
        return null;
      }
    }
    return null;
  };
  const siteName = value(store)?.["name"] || "[Your Store Name]";
  const siteDescription =
    value(store)?.["description"] || "[Your Store Description]";
  const socialMediaValue = value(socialMedia) || {
    instagram: "",
    facebook: "",
    twitter: "",
  };

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-6">
            {storeLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <h2 className="font-serif text-2xl tracking-elegant">
                {siteName}
              </h2>
            )}
            {storeLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <p className="text-sm leading-relaxed text-primary-foreground/70">
                {siteDescription}
              </p>
            )}
            <div className="flex gap-4">
              {socialMediaLoading ? (
                <Instagram className="h-5 w-5 animate-pulse" />
              ) : (
                socialMediaValue?.["instagram"] && (
                  <a
                    href={`https://instagram.com/${socialMediaValue?.["instagram"]}`}
                    className="text-primary-foreground/70 transition-colors hover:text-accent"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )
              )}
              {socialMediaLoading ? (
                <Facebook className="h-5 w-5 animate-pulse" />
              ) : (
                socialMediaValue?.["facebook"] && (
                  <a
                    href={`https://facebook.com/${socialMediaValue?.["facebook"]}`}
                    className="text-primary-foreground/70 transition-colors hover:text-accent"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )
              )}
              {socialMediaLoading ? (
                <Twitter className="h-5 w-5 animate-pulse" />
              ) : (
                socialMediaValue?.["twitter"] && (
                  <a
                    href={`https://twitter.com/${socialMediaValue?.["twitter"]}`}
                    className="text-primary-foreground/70 transition-colors hover:text-accent"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium tracking-luxury uppercase">
              Shop
            </h3>
            <nav className="flex flex-col gap-3">
              <Link
                to="/category/women"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
              >
                Women
              </Link>
              <Link
                to="/category/men"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
              >
                Men
              </Link>
              <Link
                to="/category/accessories"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
              >
                Accessories
              </Link>
              <Link
                to="/category/new-arrivals"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent"
              >
                New Arrivals
              </Link>
            </nav>
          </div>

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
            © {currentYear} {siteName}. All rights reserved.
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
