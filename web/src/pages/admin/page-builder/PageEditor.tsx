import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Page, PageSectionData, SectionType } from "@/lib/page-types";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createDefaultSection } from "@/lib/utils";

export default function PageEditor() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState<Page | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );

  // Fetch page data
  const { data: pageData, isLoading } = useQuery<Page>({
    queryKey: ["page", pageId],
    queryFn: async () => {
      const response = await api.getPage(pageId!);
      return response;
    },
    enabled: !!pageId,
  });

  useEffect(() => {
    if (pageData) {
      setPage(pageData);
    }
  }, [pageData]);

  // Save page mutation
  const savePageMutation = useMutation({
    mutationFn: async (updatedPage: Page) => {
      const response = await api.updatePage(pageId!, updatedPage);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page saved successfully");
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save page");
    },
  });

  // Publish page mutation
  const publishPageMutation = useMutation({
    mutationFn: async () => {
      if (!page) return;
      const updatedPage = {
        ...page,
        status: "published" as const,
        published_at: new Date().toISOString(),
      };
      const response = await api.updatePage(pageId!, updatedPage);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page published successfully");
      if (page) {
        setPage({ ...page, status: "published" });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to publish page");
    },
  });

  const handleSave = () => {
    if (page) {
      savePageMutation.mutate(page);
    }
  };

  const handlePublish = () => {
    if (hasChanges) {
      toast.error("Please save your changes before publishing");
      return;
    }
    publishPageMutation.mutate();
  };

  const handleAddSection = (sectionType: SectionType) => {
    if (!page) return;

    const newSection = createDefaultSection(sectionType);
    const updatedPage = {
      ...page,
      sections: [...page.sections, newSection],
      updated_at: new Date().toISOString(),
    };

    setPage(updatedPage);
    setHasChanges(true);
    setIsAddSectionDialogOpen(false);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!page) return;

    if (window.confirm("Are you sure you want to delete this section?")) {
      const updatedPage = {
        ...page,
        sections: page.sections.filter((s) => s.id !== sectionId),
        updated_at: new Date().toISOString(),
      };

      setPage(updatedPage);
      setHasChanges(true);

      if (selectedSectionId === sectionId) {
        setSelectedSectionId(null);
      }
    }
  };

  const handleMoveSection = (sectionId: string, direction: "up" | "down") => {
    if (!page) return;

    const currentIndex = page.sections.findIndex((s) => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= page.sections.length) return;

    const newSections = [...page.sections];
    [newSections[currentIndex], newSections[newIndex]] = [
      newSections[newIndex],
      newSections[currentIndex],
    ];

    const updatedPage = {
      ...page,
      sections: newSections,
      updated_at: new Date().toISOString(),
    };

    setPage(updatedPage);
    setHasChanges(true);
  };

  const handleUpdateSection = (
    sectionId: string,
    updates: Partial<PageSectionData>,
  ) => {
    if (!page) return;

    const updatedPage = {
      ...page,
      sections: page.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      ),
      updated_at: new Date().toISOString(),
    };

    setPage(updatedPage);
    setHasChanges(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdatePageMeta = (field: keyof Page, value: any) => {
    if (!page) return;

    const updatedPage = {
      ...page,
      [field]: value,
      updated_at: new Date().toISOString(),
    };

    setPage(updatedPage);
    setHasChanges(true);
  };

  if (isLoading || !page) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const selectedSection = page.sections.find((s) => s.id === selectedSectionId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/pages")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-light text-foreground">
                {page.title}
              </h1>
              <Badge
                variant={page.status === "published" ? "default" : "secondary"}
              >
                {page.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{page.slug}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(page.slug, "_blank")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || savePageMutation.isPending}
          >
            {savePageMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          {page.status === "draft" && (
            <Button
              onClick={handlePublish}
              disabled={hasChanges || publishPageMutation.isPending}
              variant="default"
            >
              Publish
            </Button>
          )}
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
              disabled={savePageMutation.isPending}
            >
              Save Now
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Sections List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sections</CardTitle>
                  <CardDescription>Manage page sections</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAddSectionDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {page.sections.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No sections yet. Add your first section!
                </div>
              ) : (
                page.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`group flex items-center gap-2 rounded-lg border p-3 transition-colors cursor-pointer ${
                      selectedSectionId === section.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {section.type.charAt(0).toUpperCase() +
                          section.type.slice(1)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {"title" in section ? section.title : "Section"}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(section.id, "up");
                        }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(section.id, "down");
                        }}
                        disabled={index === page.sections.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Section Editor or Page Settings */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Page Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-6">
              {selectedSection ? (
                <SectionEditor
                  section={selectedSection}
                  onUpdate={(updates) =>
                    handleUpdateSection(selectedSection.id, updates)
                  }
                />
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">
                      Select a section to edit
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click on a section from the list to customize its content
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <PageSettingsEditor page={page} onUpdate={handleUpdatePageMeta} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Section Dialog */}
      <Dialog
        open={isAddSectionDialogOpen}
        onOpenChange={setIsAddSectionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>
              Choose a section type to add to your page
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {[
              { type: "hero", label: "Hero", desc: "Large banner with CTA" },
              { type: "about", label: "About", desc: "Image with text" },
              { type: "features", label: "Features", desc: "Feature grid" },
              { type: "products", label: "Products", desc: "Product showcase" },
              {
                type: "testimonials",
                label: "Testimonials",
                desc: "Customer reviews",
              },
              { type: "gallery", label: "Gallery", desc: "Image gallery" },
              { type: "contact", label: "Contact", desc: "Contact form" },
              { type: "cta", label: "Call to Action", desc: "Action button" },
              { type: "text", label: "Text", desc: "Rich text content" },
              { type: "video", label: "Video", desc: "Video embed" },
              { type: "spacer", label: "Spacer", desc: "Empty space" },
            ].map((section) => (
              <Button
                key={section.type}
                variant="outline"
                className="h-auto flex-col items-start p-4"
                onClick={() => handleAddSection(section.type as SectionType)}
              >
                <span className="font-medium">{section.label}</span>
                <span className="text-xs text-muted-foreground">
                  {section.desc}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Section Editor Component
function SectionEditor({
  section,
  onUpdate,
}: {
  section: PageSectionData;
  onUpdate: (updates: Partial<PageSectionData>) => void;
}) {
  // Render different editors based on section type
  // This is a simplified version - you would create specific editors for each type

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{section.type} Section</CardTitle>
        <CardDescription>
          Configure this section's content and appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Common fields */}
        {"title" in section && (
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={section.title}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => onUpdate({ title: e.target.value } as any)}
            />
          </div>
        )}

        {"subtitle" in section && (
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={section.subtitle}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => onUpdate({ subtitle: e.target.value } as any)}
            />
          </div>
        )}

        {"description" in section && (
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={section.description}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => onUpdate({ description: e.target.value } as any)}
              rows={4}
            />
          </div>
        )}

        {"background_color" in section && (
          <div className="space-y-2">
            <Label>Background Color</Label>
            <Input
              type="color"
              value={section.background_color || "#ffffff"}
              onChange={(e) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onUpdate({ background_color: e.target.value } as any)
              }
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Additional fields for this section type would appear here
        </p>
      </CardContent>
    </Card>
  );
}

// Page Settings Editor Component
function PageSettingsEditor({
  page,
  onUpdate,
}: {
  page: Page;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (field: keyof Page, value: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Settings</CardTitle>
        <CardDescription>Configure SEO and page metadata</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Page Title</Label>
          <Input
            value={page.title}
            onChange={(e) => onUpdate("title", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Slug (URL)</Label>
          <Input
            value={page.slug}
            onChange={(e) => onUpdate("slug", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The URL path for this page (e.g., /about-us)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Meta Title</Label>
          <Input
            value={page.meta_title}
            onChange={(e) => onUpdate("meta_title", e.target.value)}
            placeholder="SEO title for search engines"
          />
        </div>

        <div className="space-y-2">
          <Label>Meta Description</Label>
          <Textarea
            value={page.meta_description}
            onChange={(e) => onUpdate("meta_description", e.target.value)}
            placeholder="SEO description for search engines"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Meta Keywords</Label>
          <Input
            value={page.meta_keywords}
            onChange={(e) => onUpdate("meta_keywords", e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>

        <div className="space-y-2">
          <Label>OG Image URL</Label>
          <Input
            value={page.og_image}
            onChange={(e) => onUpdate("og_image", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Image shown when sharing on social media
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
