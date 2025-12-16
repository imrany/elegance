import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ShoppingBagIcon,
  TruckIcon,
  ShieldIcon,
  HeartIcon,
  ZapIcon,
  StarIcon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import type { WebsiteConfig } from "@/lib/api";
import {
  SectionData as CombinedConfig,
  DEFAULT_CONFIG,
} from "./WebsiteBuilder";
import { cn } from "@/lib/utils";

// Icon mapping for features
const iconMap: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBagIcon />,
  Truck: <TruckIcon />,
  Shield: <ShieldIcon />,
  Heart: <HeartIcon />,
  Zap: <ZapIcon />,
  Star: <StarIcon />,
};

export default function HomePage() {
  const { data: configArray, isLoading } = useQuery<WebsiteConfig[]>({
    queryKey: ["website-config"],
    queryFn: async () => {
      const { data: configs } = await api.getAllWebsiteConfig();
      return configs;
    },
  });

  //  Use useMemo to transform the array data into a single, combined config object
  const config = useMemo(() => {
    if (!configArray) return null;

    const combinedConfig: Partial<CombinedConfig> = {};

    configArray.forEach((item) => {
      try {
        combinedConfig[item.key as keyof CombinedConfig] = JSON.parse(
          item.value as string,
        );
      } catch (e) {
        console.error(`Error parsing config key ${item.key}:`, e);
      }
    });

    // Ensure we have fallbacks to the default config structure if something is missing
    return { ...DEFAULT_CONFIG, ...combinedConfig } as CombinedConfig;
  }, [configArray]);

  console.log(config);

  // Apply theme styles
  useEffect(() => {
    if (config?.theme) {
      const root = document.documentElement;
      root.style.setProperty("--primary-color", config.theme.primaryColor);
      root.style.setProperty("--secondary-color", config.theme.secondaryColor);
      root.style.setProperty("--accent-color", config.theme.accentColor);
      root.style.setProperty("--border-radius", config.theme.borderRadius);
      document.body.style.fontFamily = config.theme.fontFamily;
    }
  }, [config?.theme]);

  // Apply SEO
  useEffect(() => {
    if (config?.seo) {
      document.title = config?.["seo"].title || "My Store";

      // Meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", config?.["seo"].description);

      // Meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", config?.["seo"].keywords);

      // OG tags
      const ogTags = [
        { property: "og:title", content: config?.["seo"].title },
        { property: "og:description", content: config?.["seo"].description },
        { property: "og:image", content: config?.["seo"].ogImage },
      ];

      ogTags.forEach(({ property, content }) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", property);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      });

      // Favicon
      if (config?.["seo"].favicon) {
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.setAttribute("rel", "icon");
          document.head.appendChild(favicon);
        }
        favicon.setAttribute("href", config?.["seo"].favicon);
      }
    }
  }, [config?.seo]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className={cn(
          "relative min-h-[600px] flex items-center justify-center text-white",
        )}
        style={{
          backgroundImage: config.hero.background_image
            ? `url(${config.hero.background_image})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {config.hero.overlay && config.hero.background_image && (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: config.hero.overlay_opacity }}
          />
        )}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            {config.hero.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">
            {config.hero.subtitle}
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => (window.location.href = config.hero.ctaLink)}
          >
            {config.hero.cta_text}
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {config.about.title}
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {config.about.description}
              </p>
              {config.about.features.length > 0 && (
                <ul className="space-y-3">
                  {config.about.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {config.about.image && (
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img
                  src={config.about.image}
                  alt="About"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {config.features.items.length > 0 && (
        <section className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {config.features.title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {config.features.subtitle}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {config.features.items.map((item, index) => (
                <Card
                  key={index}
                  className="p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-6xl mb-4">
                    {iconMap[item.icon] || "📦"}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {config.contact.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {config.contact.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a
                    href={`mailto:${config.contact.email}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {config.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <a
                    href={`tel:${config.contact.phone}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {config.contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-muted-foreground">
                    {config.contact.address}
                  </p>
                </div>
              </div>

              {config.contact.show_map && config.contact.map_url && (
                <div className="mt-6">
                  <iframe
                    src={config.contact.map_url}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Contact Form */}
            <Card className="p-6">
              <form className="space-y-4">
                <div>
                  <Input placeholder="Your Name" required />
                </div>
                <div>
                  <Input type="email" placeholder="Your Email" required />
                </div>
                <div>
                  <Input placeholder="Subject" required />
                </div>
                <div>
                  <Textarea placeholder="Your Message" rows={5} required />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            {/* Social Links */}
            {(config.social.facebook ||
              config.social.twitter ||
              config.social.instagram ||
              config.social.linkedin ||
              config.social.youtube) && (
              <div className="flex gap-4">
                {config.social.facebook && (
                  <a
                    href={config.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {config.social.twitter && (
                  <a
                    href={config.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    <Twitter className="h-6 w-6" />
                  </a>
                )}
                {config.social.instagram && (
                  <a
                    href={config.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                {config.social.linkedin && (
                  <a
                    href={config.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                )}
                {config.social.youtube && (
                  <a
                    href={config.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    <Youtube className="h-6 w-6" />
                  </a>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              {config?.["seo"].title.split(" - ")[0]}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
