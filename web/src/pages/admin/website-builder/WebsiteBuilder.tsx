import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Layout,
  Palette,
  Image as ImageIcon,
  Settings,
  Globe,
  Save,
  Eye,
  Loader2,
  Link2,
  Phone,
  ToolCase,
} from "lucide-react";
import { toast } from "sonner";
import { api, WebsiteConfig, WebsiteSettingKey } from "@/lib/api";
import { AboutSection } from "@/components/website-builder/AboutSection";
import { FeaturesSection } from "@/components/website-builder/FeaturesSection";
import { ContactSection } from "@/components/website-builder/ContactSection";
import { HeroSection } from "@/components/website-builder/HeroSection";
import { ThemeCustomizer } from "@/components/website-builder/ThemeCustomizer";
import { SocialMediaLinks } from "@/components/website-builder/SocialMediaLinks";
import { SEOSettings } from "@/components/website-builder/SEOSettings";

export interface SectionData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hero?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  about?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  features?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contact?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seo?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  social?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  smtp: any;
}

export const DEFAULT_CONFIG: SectionData = {
  hero: {
    title: "Welcome to Our Store",
    subtitle: "Discover amazing products at great prices",
    cta_text: "Shop Now",
    cta_link: "/products",
    background_image: "",
    overlay: true,
    overlay_opacity: 0.5,
  },
  about: {
    title: "About Us",
    description:
      "We are dedicated to providing the best products and services to our customers.",
    image: "",
    features: ["Quality Products", "Fast Shipping", "Great Support"],
  },
  features: {
    title: "Why Choose Us",
    subtitle: "Discover what makes us special",
    items: [
      {
        icon: "ShoppingBag",
        title: "Quality Products",
        description: "We offer only the best quality products",
      },
      {
        icon: "Truck",
        title: "Fast Delivery",
        description: "Get your orders delivered quickly",
      },
      {
        icon: "Shield",
        title: "Secure Payments",
        description: "Your transactions are always secure",
      },
    ],
  },
  contact: {
    title: "Get In Touch",
    subtitle: "We'd love to hear from you",
    email: "hello@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, Country",
    show_map: false,
    map_url: "",
  },
  theme: {
    primary_color: "#000000",
    secondary_color: "#666666",
    accent_color: "#007bff",
    font_family: "Inter",
    border_radius: "0.5rem",
  },
  seo: {
    title: "My Store - Quality Products",
    description: "Shop the best products at amazing prices",
    keywords: "store, shop, products, ecommerce",
    og_image: "",
    favicon: "",
  },
  social: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
  },
  store: {
    name: "ÉLÉGANCE",
    currency: "KES",
    free_delivery_threshold: 10000,
    logo: "/logo.png",
    announcement:
      "Free Delivery on Orders Over KES 10,000 | Luxury Fashion, Made in Kenya",
    description:
      "Discover the finest luxury fashion in Kenya, crafted with passion and precision.",
  },
  smtp: {
    enabled: false,
    from_email: "",
    resend_api_key: "",
  },
};

export default function WebsiteBuilder() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<WebsiteSettingKey>("hero");
  const [hasChanges, setHasChanges] = useState(false);
  const [localConfig, setLocalConfig] = useState<SectionData>(DEFAULT_CONFIG);

  // Fetch website config for active tab
  const { data: configData, isLoading } = useQuery<WebsiteConfig>({
    queryKey: ["website-config", activeTab],
    queryFn: async () => {
      const response = await api.getWebsiteConfig(activeTab);
      return response.data;
    },
  });

  // Parse the config value
  const parsedConfig = (() => {
    if (!configData?.value) return null;

    try {
      if (typeof configData.value === "string") {
        return JSON.parse(configData.value);
      }
      return configData.value;
    } catch (e) {
      console.error("Error parsing website settings value:", e);
      return null;
    }
  })();

  // Update local config when data changes
  useEffect(() => {
    if (parsedConfig) {
      setLocalConfig((prev) => ({
        ...prev,
        [activeTab]: parsedConfig,
      }));
    } else if (DEFAULT_CONFIG[activeTab as keyof SectionData]) {
      setLocalConfig((prev) => ({
        ...prev,
        [activeTab]: DEFAULT_CONFIG[activeTab as keyof SectionData],
      }));
    }
  }, [activeTab]);

  // Save website config
  const saveMutation = useMutation({
    mutationFn: async () => {
      const sectionData = localConfig[activeTab as keyof SectionData];
      const value = JSON.stringify(sectionData);
      const response = await api.updateWebsiteConfig(activeTab, value);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["website-config", activeTab],
      });
      toast.success(
        `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section updated successfully`,
      );
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update website");
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleConfigChange = (section: WebsiteSettingKey, data: any) => {
    setLocalConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section as keyof SectionData], ...data },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handlePreview = () => {
    window.open("/preview", "_blank");
  };

  // Reset hasChanges when switching tabs
  useEffect(() => {
    setHasChanges(false);
  }, [activeTab]);

  // FIX: Centralized loading check when rendering
  const isQueryLoading = isLoading || saveMutation.isPending;

  // Initial loading state (e.g. when app first mounts)
  if (isLoading && !configData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentSectionData =
    localConfig[activeTab as keyof SectionData] ||
    DEFAULT_CONFIG[activeTab as keyof SectionData];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
            Website Builder
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize your website appearance and content
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Changes indicator */}
      {hasChanges && (
        <Card className="border-amber-500 bg-amber-500/10">
          <CardContent className="flex items-center justify-between py-3">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              You have unsaved changes
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              Save Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as WebsiteSettingKey)}
      >
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="hero" className="gap-2">
            <Layout className="h-4 w-4" />
            <span className="hidden md:inline">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden md:inline">About</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <ToolCase className="h-4 w-4" />
            <span className="hidden md:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden md:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden md:inline">Social</span>
          </TabsTrigger>
        </TabsList>

        {isQueryLoading && !saveMutation.isPending ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-border">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="hero" className="space-y-4">
              {currentSectionData && (
                <HeroSection
                  data={currentSectionData}
                  onChange={(data) => handleConfigChange("hero", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              {currentSectionData && (
                <AboutSection
                  data={currentSectionData}
                  onChange={(data) => handleConfigChange("about", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              {currentSectionData && (
                <FeaturesSection
                  data={currentSectionData}
                  onChange={(data) => handleConfigChange("features", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              {currentSectionData && (
                <ContactSection
                  data={currentSectionData}
                  onChange={(data) => handleConfigChange("contact", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="theme" className="space-y-4">
              {currentSectionData && (
                <ThemeCustomizer
                  data={currentSectionData}
                  onChange={(data) => handleConfigChange("theme", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              {currentSectionData && (
                <SEOSettings
                  data={currentSectionData}
                  onChange={(data) => handleConfigChange("seo", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              {currentSectionData && (
                <SocialMediaLinks
                  data={currentSectionData}
                  onChange={(data) => handleConfigChange("social", data)}
                />
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
