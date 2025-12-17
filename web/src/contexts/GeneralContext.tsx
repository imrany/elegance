import { useCategories } from "@/hooks/useCategories";
import {
  api,
  WebsiteConfig,
  SectionData as CombinedWebsiteConfig,
  Category,
  WebsiteSettingKey,
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

// Define the precise shape of the mutation input
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
  const { data: categories = [] } = useCategories();
  const queryClient = useQueryClient();

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
    // Use the variables argument in onSuccess to ensure you invalidate the correct key
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["website-config"],
      });
      const sectionName =
        variables.key.charAt(0).toUpperCase() + variables.key.slice(1);
      toast.success(`${sectionName} section updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update website");
    },
  });

  const websiteConfig = useMemo(() => {
    if (!configArray) return DEFAULT_CONFIG as CombinedWebsiteConfig;

    const combinedConfig: Partial<CombinedWebsiteConfig> = {};
    configArray.forEach((item) => {
      try {
        combinedConfig[item.key as keyof CombinedWebsiteConfig] =
          typeof item.value === "string" ? JSON.parse(item.value) : item.value;
      } catch (e) {
        console.error(`Error parsing config key ${item.key}:`, e);
      }
    });

    return { ...DEFAULT_CONFIG, ...combinedConfig } as CombinedWebsiteConfig;
  }, [configArray]);

  // Theme & SEO effects (logic remains same but using optional chaining)
  useEffect(() => {
    const theme = websiteConfig?.theme;
    if (!theme) return;

    const root = document.documentElement;
    if (theme.primary_color)
      root.style.setProperty("--theme-primary", theme.primary_color);
    if (theme.secondary_color)
      root.style.setProperty("--theme-secondary", theme.secondary_color);
    if (theme.accent_color)
      root.style.setProperty("--theme-accent", theme.accent_color);
    if (theme.border_radius)
      root.style.setProperty("--theme-radius", theme.border_radius);

    const fontStack = ["Inter", "Poppins", "Montserrat"].includes(
      theme.font_family,
    )
      ? `"${theme.font_family}", sans-serif`
      : `"${theme.font_family}", serif`;
    root.style.setProperty("--font-main", fontStack);
  }, [websiteConfig?.theme]);

  // Handle SEO
  useEffect(() => {
    const seo = websiteConfig?.seo;
    if (!seo) return;

    document.title = seo.title || "My Store";
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(isProperty ? "property" : "name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content || "");
    };

    updateMeta("description", seo.description);
    updateMeta("keywords", seo.keywords);
    updateMeta("og:title", seo.title, true);
    updateMeta("og:description", seo.description, true);
    updateMeta("og:image", seo.og_image, true);
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
      value={{
        websiteConfig,
        categories,
        saveWebsiteConfig,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
}

export function useGeneralContext() {
  const context = useContext(GeneralContext);
  if (!context)
    throw new Error("useGeneralContext must be used within GeneralProvider");
  return context;
}
