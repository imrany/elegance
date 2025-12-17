import { useCategories } from "@/hooks/useCategories";
import {
  api,
  WebsiteConfig,
  SectionData as CombinedWebsiteConfig,
  Category,
} from "@/lib/api";
import { DEFAULT_CONFIG, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

interface GeneralContextType {
  websiteConfig: CombinedWebsiteConfig;
  categories: Category[];
}

const GeneralContext = createContext<GeneralContextType | undefined>(undefined);

export function GeneralProvider({ children }: { children: ReactNode }) {
  const { data: categories } = useCategories();
  const {
    data: configArray,
    isLoading,
    error,
  } = useQuery<WebsiteConfig[]>({
    queryKey: ["website-config"],
    queryFn: async () => {
      const { data: config } = await api.getAllWebsiteConfig();
      return config;
    },
  });

  //  Use useMemo to transform the array data into a single, combined config object
  const websiteConfig = useMemo(() => {
    if (!configArray) return null;

    const combinedConfig: Partial<CombinedWebsiteConfig> = {};

    configArray.forEach((item) => {
      try {
        combinedConfig[item.key as keyof CombinedWebsiteConfig] = JSON.parse(
          item.value as string,
        );
      } catch (e) {
        console.error(`Error parsing config key ${item.key}:`, e);
      }
    });

    // Ensure we have fallbacks to the default config structure if something is missing
    return { ...DEFAULT_CONFIG, ...combinedConfig } as CombinedWebsiteConfig;
  }, [configArray]);

  // Apply theme styles
  useEffect(() => {
    if (websiteConfig?.theme) {
      const root = document.documentElement;
      const theme = websiteConfig.theme;

      // Use specific theme override variables
      // These will accept HEX strings directly from your DB (e.g. #2fb17f)
      if (theme.primary_color)
        root.style.setProperty("--theme-primary", theme.primary_color);
      if (theme.secondary_color)
        root.style.setProperty("--theme-secondary", theme.secondary_color);
      if (theme.accent_color)
        root.style.setProperty("--theme-accent", theme.accent_color);
      if (theme.border_radius)
        root.style.setProperty("--theme-radius", theme.border_radius);

      // Font Handling
      let fontStack = theme.font_family;
      const sansFonts = ["Inter", "Poppins", "Montserrat"];
      if (sansFonts.includes(fontStack)) {
        fontStack = `"${fontStack}", sans-serif`;
      } else {
        fontStack = `"${fontStack}", serif`;
      }
      root.style.setProperty("--font-main", fontStack);
    }
  }, [websiteConfig?.theme]);

  // Apply SEO
  useEffect(() => {
    if (websiteConfig?.seo) {
      document.title = websiteConfig.seo.title || "My Store";

      // Meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute(
        "content",
        websiteConfig?.["seo"].description,
      );

      // Meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", websiteConfig?.["seo"].keywords);

      // OG tags
      const ogTags = [
        { property: "og:title", content: websiteConfig?.["seo"].title },
        {
          property: "og:description",
          content: websiteConfig?.["seo"].description,
        },
        { property: "og:image", content: websiteConfig?.["seo"].og_image },
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
      if (websiteConfig?.["seo"].favicon) {
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.setAttribute("rel", "icon");
          document.head.appendChild(favicon);
        }
        favicon.setAttribute("href", websiteConfig?.["seo"].favicon);
      }
    }
  }, [websiteConfig?.seo]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!websiteConfig) return null;

  return (
    <GeneralContext.Provider value={{ websiteConfig, categories }}>
      {children}
    </GeneralContext.Provider>
  );
}

export function useGeneralContext() {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error("useGeneralContext must be used within a GeneralProvider");
  }
  return context;
}
