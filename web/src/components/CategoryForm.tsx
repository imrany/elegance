import { useEffect, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, API_URL, Category } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CategoryFormProps {
  category?: Category | null;
  onSuccess?: () => void;
}

const CACHE_KEY = "category_form_draft";

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  // Helper function to get cached data
  const getCachedData = () => {
    if (category) return null; // Don't use cache when editing existing category

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  const cachedData = getCachedData();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: category?.name || cachedData?.name || "",
    description: category?.description || cachedData?.description || "",
    slug: category?.slug || cachedData?.slug || "",
    image_url: category?.image_url || cachedData?.image_url || "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  // Update form when category prop changes
  useEffect(() => {
    setFormData({
      name: category?.name || cachedData?.name || "",
      description: category?.description || cachedData?.description || "",
      slug: category?.slug || cachedData?.slug || "",
      image_url: category?.image_url || cachedData?.image_url || "",
    });
  }, [category]);

  // Save to cache whenever form data changes (only for new categories)
  useEffect(() => {
    if (!category) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(formData));
      } catch (error) {
        console.error("Error saving to cache:", error);
      }
    }
  }, [formData, category]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const autoSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.name, category]);

  // Clear cache function
  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const response = await api.uploadImage(formDataUpload);
      return response.data.url;
    },
    onSuccess: (url) => {
      const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
      setFormData((prev) => ({ ...prev, image_url: fullUrl }));
      toast.success("Image uploaded successfully");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload image");
    },
    onSettled: () => {
      setUploadingImage(false);
    },
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.createCategory({
        id: null,
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
        description: data.description || null,
        image_url: data.image_url || null,
        updated_at: null,
        created_at: null,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
      clearCache();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!category?.id) throw new Error("Category ID is required");
      const response = await api.updateCategory({
        id: category.id,
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
        description: data.description || null,
        image_url: data.image_url || null,
        created_at: category.created_at,
        updated_at: null,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      e.target.value = "";
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    uploadImageMutation.mutate(file);
  };

  const handleRemoveImage = () => {
    const imageToDelete = formData.image_url;
    setFormData((prev) => ({ ...prev, image_url: "" }));
    // Delete image from server
    try {
      const filename = imageToDelete.split("/").pop();
      if (filename) {
        api.deleteImage(filename).catch((error) => {
          console.error("Error deleting image:", error);
        });
      }
    } catch (error) {
      console.error("Error parsing image URL:", error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearForm = () => {
    if (confirm("Are you sure you want to clear all form data?")) {
      setFormData({
        name: "",
        description: "",
        slug: "",
        image_url: "",
      });
      clearCache();
      toast.success("Form cleared");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (category?.id) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const hasFormData =
    !category && (formData.name || formData.description || formData.image_url);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Category Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g., Electronics, Clothing, Books"
          required
          disabled={isLoading}
        />
        {formData.name === "New Arrivals" ||
        formData.slug === "new-arrivals" ? (
          <p className="text-xs text-destructive">
            Category name cannot be "New Arrivals"
          </p>
        ) : null}
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={formData.slug}
          readOnly
          className="bg-muted cursor-not-allowed"
          placeholder="auto-generated-from-name"
        />
        <p className="text-xs text-muted-foreground">
          Auto-generated from category name
        </p>
      </div>

      {/* Category Image */}
      <div className="space-y-3">
        <Label>Category Image (Optional)</Label>
        {formData.image_url ? (
          <div
            className={cn(
              "relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-border bg-secondary",
              `${isLoading || formData.name === "New Arrivals" || formData.slug === "new-arrivals" ? "opacity-50 cursor-not-allowed" : ""}`,
            )}
          >
            {uploadingImage ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <img
                  src={formData.image_url}
                  alt={formData.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded-full bg-destructive p-2 text-destructive-foreground shadow-sm transition-opacity hover:opacity-80"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="relative aspect-video w-full max-w-sm">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={
                uploadingImage ||
                isLoading ||
                formData.name === "New Arrivals" ||
                formData.slug === "new-arrivals"
              }
              className="hidden"
              id="category-image-upload"
            />
            <label
              htmlFor="category-image-upload"
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 transition-colors hover:bg-secondary"
            >
              {uploadingImage ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  <span className="mt-2 text-sm font-medium text-foreground">
                    Upload Category Image
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Click to browse
                  </span>
                </>
              )}
            </label>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Recommended size: 1200x675px. Max 2MB.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Brief description of this category..."
          rows={4}
          disabled={
            isLoading ||
            formData.name === "New Arrivals" ||
            formData.slug === "new-arrivals"
          }
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {hasFormData && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearForm}
            disabled={isLoading || uploadingImage}
          >
            Clear
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1 sm:flex-initial disabled:cursor-not-allowed"
          disabled={
            isLoading ||
            uploadingImage ||
            formData.name === "New Arrivals" ||
            formData.slug === "new-arrivals"
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {category ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{category ? "Update Category" : "Create Category"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
