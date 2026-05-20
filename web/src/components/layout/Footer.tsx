import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Link2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeneralContext } from "@/contexts/GeneralContext";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";
import { confettiBasic } from "../Confetti";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { categories, websiteConfig } = useGeneralContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Guard against initial null/undefined context state while data loads
  if (!websiteConfig) {
    return (
      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="container py-8 flex justify-center items-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary-foreground/50" />
        </div>
      </footer>
    );
  }

  const socialMedia = websiteConfig?.social;
  const store = websiteConfig?.store || { name: "Store", description: "" };

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    // Reset old alerts before hitting the API endpoints again
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/api/email/subscribe`, {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      confettiBasic();
      setMessage(data.message || "Thank you for subscribing!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errMsg = err?.message || "Failed to subscribe";
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

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

            <div className="flex flex-wrap gap-4">
              {socialMedia?.["twitter"] && (
                <a
                  href={socialMedia["twitter"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 transition-colors hover:text-accent-foreground"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.["instagram"] && (
                <a
                  href={socialMedia["instagram"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 transition-colors hover:text-accent-foreground"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.["facebook"] && (
                <a
                  href={socialMedia["facebook"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 transition-colors hover:text-accent-foreground"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.["linkedin"] && (
                <a
                  href={socialMedia["linkedin"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 transition-colors hover:text-accent-foreground"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.["youtube"] && (
                <a
                  href={socialMedia["youtube"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 transition-colors hover:text-accent-foreground"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {socialMedia?.["tiktok"] && (
                <a
                  href={socialMedia["tiktok"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 transition-colors hover:text-accent-foreground"
                >
                  <Link2 className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium tracking-luxury uppercase">
              Shop
            </h3>
            <nav className="flex flex-col gap-3">
              {categories && categories.length > 0 ? (
                categories
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
                      className="text-sm text-primary-foreground/70 transition-colors hover:text-accent-foreground"
                    >
                      {category.name}
                    </Link>
                  ))
              ) : (
                <span className="text-sm text-primary-foreground/40 italic">
                  No categories found
                </span>
              )}
            </nav>
          </div>

          {/* Help */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium tracking-luxury uppercase">
              Help
            </h3>
            <nav className="flex flex-col gap-3">
              <Link
                to="/about-us"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent-foreground"
              >
                About Us
              </Link>
              <Link
                to="/faqs?search=shipping"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent-foreground"
              >
                Shipping & Returns
              </Link>
              <Link
                to="/guide"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent-foreground"
              >
                Guide
              </Link>
              <Link
                to="/faqs"
                className="text-sm text-primary-foreground/70 transition-colors hover:text-accent-foreground"
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

            {!error && !message ? (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/30"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSubmitting}
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Join"
                  )}
                </Button>
              </form>
            ) : error ? (
              <div className="space-y-2">
                <p className="text-sm text-red-400 font-medium">{error}</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs text-primary-foreground/50 hover:text-primary-foreground underline"
                  onClick={() => setError("")}
                >
                  Try again
                </Button>
              </div>
            ) : (
              <p className="text-sm text-emerald-400 font-medium">{message}</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-xs text-primary-foreground/50">
              © {currentYear} {store.name}. All rights reserved.
            </p>
            <p className="text-xs text-primary-foreground/40">
              Made by{" "}
              <a
                href="https://github.com/imrany"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-foreground/60 transition-colors hover:text-accent-foreground underline underline-offset-2"
              >
                Imran
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <Link
              to="/faqs?search=account"
              className="text-xs text-primary-foreground/50 hover:text-primary-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              to="/faqs?search=shipping"
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
