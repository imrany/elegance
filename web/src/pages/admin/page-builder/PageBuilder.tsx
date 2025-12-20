import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Copy,
  Globe,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Page, PageStatus, PageTemplate } from "@/lib/page-types";
import { createDefaultPage } from "@/lib/utils";

export default function PageBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageTemplate, setNewPageTemplate] =
    useState<PageTemplate>("custom");

  // Fetch all pages
  const { data: pages, isLoading } = useQuery<Page[]>({
    queryKey: ["pages"],
    queryFn: async () => {
      const response = await api.getPages();
      console.log("Retrieved %d pages, %v", response.length, response);
      return response;
    },
  });

  // Create page mutation
  const createPageMutation = useMutation({
    mutationFn: async (page: Partial<Page>) => {
      console.log(page);
      const response = await api.createPage(page);
      return response;
    },
    onSuccess: (newPage) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page created successfully");
      setIsCreateDialogOpen(false);
      setNewPageTitle("");
      navigate(`/admin/pages/${newPage.id}/edit`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create page");
    },
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      await api.deletePage(pageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete page");
    },
  });

  // Duplicate page mutation
  const duplicatePageMutation = useMutation({
    mutationFn: async (page: Page) => {
      const duplicatedPage = {
        ...page,
        id: undefined,
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy`,
        status: "draft" as PageStatus,
      };
      const response = await api.createPage(duplicatedPage);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast.success("Page duplicated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to duplicate page");
    },
  });

  const handleCreatePage = () => {
    if (!newPageTitle.trim()) {
      toast.error("Please enter a page title");
      return;
    }

    const slug = newPageTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newPage = createDefaultPage(newPageTemplate);
    newPage.title = newPageTitle;
    newPage.slug = `/${slug}`;
    newPage.meta_title = newPageTitle;

    createPageMutation.mutate(newPage);
  };

  const handleDeletePage = (pageId: string) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      deletePageMutation.mutate(pageId);
    }
  };

  const handleDuplicatePage = (page: Page) => {
    duplicatePageMutation.mutate(page);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
            Page Builder
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your website pages
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>
                Choose a template or start with a blank page
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  placeholder="About Us"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select
                  value={newPageTemplate}
                  onValueChange={(value) =>
                    setNewPageTemplate(value as PageTemplate)
                  }
                >
                  <SelectTrigger id="template">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home Page</SelectItem>
                    <SelectItem value="about">About Page</SelectItem>
                    <SelectItem value="contact">Contact Page</SelectItem>
                    <SelectItem value="custom">Blank Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePage}
                disabled={createPageMutation.isPending}
              >
                {createPageMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>Create Page</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages Grid */}
      {pages && pages.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Card key={page.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      {page.slug}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      page.status === "published" ? "default" : "secondary"
                    }
                  >
                    {page.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  <p>Template: {page.template}</p>
                  <p>Sections: {page.sections.length}</p>
                  <p>
                    Updated: {new Date(page.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/admin/pages/${page.id}/edit`)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(page.slug, "_blank")}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicatePage(page)}
                    disabled={duplicatePageMutation.isPending}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePage(page.id)}
                    disabled={deletePageMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No pages yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Get started by creating your first page
            </p>
            <Button
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Page
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
