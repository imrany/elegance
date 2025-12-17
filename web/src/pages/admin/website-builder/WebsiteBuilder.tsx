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
import {
  AboutType,
  api,
  ContactType,
  FeaturesType,
  HeroType,
  SectionData,
  SeoType,
  SocialType,
  ThemeType,
  WebsiteConfig,
  WebsiteSettingKey,
} from "@/lib/api";
import { AboutSection } from "@/components/website-builder/AboutSection";
import { FeaturesSection } from "@/components/website-builder/FeaturesSection";
import { ContactSection } from "@/components/website-builder/ContactSection";
import { HeroSection } from "@/components/website-builder/HeroSection";
import { ThemeCustomizer } from "@/components/website-builder/ThemeCustomizer";
import { SocialMediaLinks } from "@/components/website-builder/SocialMediaLinks";
import { SEOSettings } from "@/components/website-builder/SEOSettings";
import { DEFAULT_CONFIG } from "@/lib/utils";

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
    if (!parsedConfig) return;

    const currentLocal = localConfig[activeTab as keyof SectionData];

    if (!hasChanges) {
      // Only update if the content has actually changed to prevent loops
      if (JSON.stringify(currentLocal) !== JSON.stringify(parsedConfig)) {
        setLocalConfig((prev) => ({
          ...prev,
          // We overwrite the entire section with the clean data from the API
          [activeTab]: parsedConfig,
        }));
      }
    }
  }, [activeTab, parsedConfig, hasChanges]);

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

  // Ensure 'section' is typed as WebsiteSettingKey
  const handleConfigChange = <K extends WebsiteSettingKey>(
    section: K,
    data: Partial<SectionData[K]>,
  ) => {
    setLocalConfig((prev) => ({
      ...prev,
      [section]: {
        // Use type assertion here if the compiler still struggles with index signatures
        ...(prev[section] as object),
        ...data,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handlePreview = () => {
    window.open("/", "_blank");
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
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
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
        {/* The container: fits width, scrolls horizontally, hides scrollbar */}
        <TabsList className="h-auto max-w-full items-center justify-start border-b bg-transparent p-0 scrollbar-hide grid grid-cols-3 md:grid-cols-7 md:bg-muted md:p-1">
          {[
            { value: "hero", icon: Layout, label: "Hero" },
            { value: "about", icon: ImageIcon, label: "About" },
            { value: "features", icon: ToolCase, label: "Features" },
            { value: "contact", icon: Phone, label: "Contact" },
            { value: "theme", icon: Palette, label: "Theme" },
            { value: "seo", icon: Settings, label: "SEO" },
            { value: "social", icon: Link2, label: "Social" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex min-w-[100px] flex-shrink-0 items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent md:min-w-0 md:flex-1 md:rounded-sm md:border-0 md:px-2 md:py-1.5 md:data-[state=active]:bg-background"
            >
              <tab.icon className="h-4 w-4" />
              <span className="inline md:hidden lg:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
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
                  data={currentSectionData as HeroType}
                  onChange={(data) => handleConfigChange("hero", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              {currentSectionData && (
                <AboutSection
                  data={currentSectionData as AboutType}
                  onChange={(data) => handleConfigChange("about", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              {currentSectionData && (
                <FeaturesSection
                  data={currentSectionData as FeaturesType}
                  onChange={(data) => handleConfigChange("features", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              {currentSectionData && (
                <ContactSection
                  data={currentSectionData as ContactType}
                  onChange={(data) => handleConfigChange("contact", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="theme" className="space-y-4">
              {currentSectionData && (
                <ThemeCustomizer
                  data={currentSectionData as ThemeType}
                  onChange={(data) => handleConfigChange("theme", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              {currentSectionData && (
                <SEOSettings
                  data={currentSectionData as SeoType}
                  onChange={(data) => handleConfigChange("seo", data)}
                />
              )}
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              {currentSectionData && (
                <SocialMediaLinks
                  data={currentSectionData as SocialType}
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
