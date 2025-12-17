import { useCategories } from "@/hooks/useCategories";
import {
  api,
  WebsiteConfig,
  SectionData as CombinedWebsiteConfig,
  Category,
  WebsiteSettingKey,
  API_URL,
} from "@/lib/api";
import { DEFAULT_CONFIG } from "@/lib/utils";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { toast } from "sonner";

interface SaveConfigVars {
  key: WebsiteSettingKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sectionData: any;
}

interface GeneralContextType {
  websiteConfig: CombinedWebsiteConfig;
  categories: Category[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveWebsiteConfig: UseMutationResult<any, Error, SaveConfigVars, unknown>;
}

const GeneralContext = createContext<GeneralContextType | undefined>(undefined);

export function GeneralProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();

  const { data: configArray, isLoading } = useQuery<WebsiteConfig[]>({
    queryKey: ["website-config"],
    queryFn: async () => {
      const { data } = await api.getAllWebsiteConfig();
      return data;
    },
  });

  const saveWebsiteConfig = useMutation({
    mutationFn: async ({ key, sectionData }: SaveConfigVars) => {
      const value = JSON.stringify(sectionData);
      const response = await api.updateWebsiteConfig(key, value);
      return response.data;
    },
    // Optimistic UI Update: Updates the cache immediately before the server responds
    onMutate: async (newConfig) => {
      await queryClient.cancelQueries({ queryKey: ["website-config"] });
      const previousConfig = queryClient.getQueryData<WebsiteConfig[]>([
        "website-config",
      ]);

      queryClient.setQueryData<WebsiteConfig[]>(["website-config"], (old) => {
        if (!old) return old;
        return old.map((item) =>
          item.key === newConfig.key
            ? { ...item, value: JSON.stringify(newConfig.sectionData) }
            : item,
        );
      });
      return { previousConfig };
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousConfig) {
        queryClient.setQueryData(["website-config"], context.previousConfig);
      }
      toast.error(error.message || "Failed to update website");
    },
    onSuccess: (_, variables) => {
      const sectionName =
        variables.key.charAt(0).toUpperCase() + variables.key.slice(1);
      toast.success(`${sectionName} section updated successfully`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["website-config"] });
    },
  });

  const websiteConfig = useMemo(() => {
    const combinedConfig: Partial<CombinedWebsiteConfig> = {};
    configArray?.forEach((item) => {
      try {
        combinedConfig[item.key as keyof CombinedWebsiteConfig] =
          typeof item.value === "string" ? JSON.parse(item.value) : item.value;
      } catch (e) {
        console.error(`Error parsing config key ${item.key}:`, e);
      }
    });
    return { ...DEFAULT_CONFIG, ...combinedConfig } as CombinedWebsiteConfig;
  }, [configArray]);

  // Theme Management
  useEffect(() => {
    const theme = websiteConfig?.theme;
    if (!theme) return;

    const root = document.documentElement;
    const styles = {
      "--theme-primary": theme.primary_color,
      "--theme-secondary": theme.secondary_color,
      "--theme-accent": theme.accent_color,
      "--theme-radius": theme.border_radius,
      "--font-main": ["Inter", "Poppins", "Montserrat"].includes(
        theme.font_family,
      )
        ? `"${theme.font_family}", sans-serif`
        : `"${theme.font_family}", serif`,
    };

    Object.entries(styles).forEach(([key, val]) => {
      if (val) root.style.setProperty(key, val);
    });
  }, [websiteConfig?.theme]);

  // SEO Management
  useEffect(() => {
    const seo = websiteConfig?.seo;
    if (!seo) return;

    document.title = seo.title || "My Store";

    // Update/Create Meta Tags
    const updateMeta = (attr: string, key: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("name", "description", seo.description);
    updateMeta("name", "keywords", seo.keywords);
    updateMeta("property", "og:title", seo.title);
    updateMeta("property", "og:description", seo.description);
    updateMeta("property", "og:image", seo.og_image);

    // Update Favicon (Crucial)
    if (seo.favicon) {
      // Select any existing icon link (rel="icon" or rel="shortcut icon")
      let favicon = document.querySelector("link[rel~='icon']");

      if (!favicon) {
        favicon = document.createElement("link");
        favicon.setAttribute("rel", "icon");
        document.head.appendChild(favicon);
      }

      // Prefix with API_URL if it's a relative path from your DB
      favicon.setAttribute(
        "href",
        seo.favicon.startsWith("http")
          ? seo.favicon
          : `${API_URL}${seo.favicon}`,
      );
    }
  }, [websiteConfig?.seo]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <GeneralContext.Provider
      value={{ websiteConfig, categories, saveWebsiteConfig }}
    >
      {children}
    </GeneralContext.Provider>
  );
}

export const useGeneralContext = () => {
  const context = useContext(GeneralContext);
  if (!context)
    throw new Error("useGeneralContext must be used within GeneralProvider");
  return context;
};
