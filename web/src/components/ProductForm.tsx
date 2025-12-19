import { api, API_URL, Product, SiteSetting } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

const CACHE_KEY = "product_form_draft";

// Product Form Component
export function ProductForm({
  product,
  categories,
  onSuccess,
}: {
  product: Product | null;
  categories: { id: string; name: string; slug: string }[];
  onSuccess: () => void;
}) {
  // Helper function to get cached data
  const getCachedData = () => {
    if (product) return null; // Don't use cache when editing existing product

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  const cachedData = getCachedData();

  const [formData, setFormData] = useState({
    id: product?.id || null,
    category_name: product?.category_name || cachedData?.category_name || "",
    created_at: product?.created_at || null,
    updated_at: null,
    name: product?.name || cachedData?.name || "",
    slug: product?.slug || cachedData?.slug || "",
    description: product?.description || cachedData?.description || "",
    price: product?.price || cachedData?.price || 0,
    original_price: product?.original_price || cachedData?.original_price || 0,
    category_id: product?.category_id || cachedData?.category_id || "",
    images: product?.images || cachedData?.images || [],
    sizes: product?.sizes?.join(", ") || cachedData?.sizes || "",
    colors: product?.colors?.join(", ") || cachedData?.colors || "",
    stock: product?.stock || cachedData?.stock || 0,
    featured: product?.featured || cachedData?.featured || false,
    is_new:
      product?.category_name === "New Arrivals" ||
      cachedData?.category_name === "New Arrivals" ||
      product?.is_new ||
      cachedData?.is_new ||
      false,
  });

  useEffect(() => {
    setFormData({
      id: product?.id || null,
      category_name: product?.category_name || cachedData?.category_name || "",
      created_at: product?.created_at || null,
      updated_at: null,
      name: product?.name || cachedData?.name || "",
      slug: product?.slug || cachedData?.slug || "",
      description: product?.description || cachedData?.description || "",
      price: product?.price || cachedData?.price || 0,
      original_price:
        product?.original_price || cachedData?.original_price || 0,
      category_id: product?.category_id || cachedData?.category_id || "",
      images: product?.images || cachedData?.images || [],
      sizes: product?.sizes?.join(", ") || cachedData?.sizes || "",
      colors: product?.colors?.join(", ") || cachedData?.colors || "",
      stock: product?.stock || cachedData?.stock || 0,
      featured: product?.featured || cachedData?.featured || false,
      is_new:
        product?.category_name === "New Arrivals" ||
        cachedData?.category_name === "New Arrivals" ||
        product?.is_new ||
        cachedData?.is_new ||
        false,
    });
  }, [product]);

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const queryClient = useQueryClient();
  const setting: SiteSetting | undefined = queryClient.getQueryData(["store"]);
  const currency = setting?.value?.["currency"] || "KES";

  // Save to cache whenever form data changes (only for new products)
  useEffect(() => {
    if (!product) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(formData));
      } catch (error) {
        console.error("Error saving to cache:", error);
      }
    }
  }, [formData, product]);

  // Clear cache function
  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !product) {
      const autoSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.name, product]);

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, index }: { file: File; index: number }) => {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const response = await api.uploadImage(formDataUpload);
      return { url: response.url, index };
    },
    onSuccess: (data) => {
      const url = data.url.startsWith("http")
        ? data.url
        : `${API_URL}${data.url}`;
      const index = data.index;

      setFormData((prev) => {
        const newImages = [...prev.images];
        if (index < newImages.length) {
          newImages[index] = url;
        } else {
          newImages.push(url);
        }
        return { ...prev, images: newImages };
      });

      toast.success("Image uploaded successfully");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload image");
    },
    onSettled: () => {
      setUploadingIndex(null);
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const data = {
        id: formData.id,
        category_name: formData.category_name,
        created_at: null,
        updated_at: null,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description || null,
        price: formData.price,
        original_price: formData.original_price || null,
        category_id: formData.category_id || null,
        images: formData.images.filter(Boolean),
        sizes: formData.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        colors: formData.colors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        stock: formData.stock,
        featured: formData.featured,
        is_new: formData.category_name === "New Arrivals" || formData.is_new,
      };

      if (product) {
        const prod = await api.updateProduct(product.id, data);
        return prod;
      } else {
        const newProduct = await api.createProduct(data);
        return newProduct;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(product ? "Product updated" : "Product created");
      clearCache(); // Clear cache on success
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
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

    setUploadingIndex(index);
    uploadImageMutation.mutate({ file, index });
  };

  const handleRemoveImage = (index: number) => {
    const imageToDelete = formData.images[index];

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

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
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = "";
    }
  };

  const handleClearForm = () => {
    if (confirm("Are you sure you want to clear all form data?")) {
      setFormData({
        id: null,
        category_name: "",
        created_at: null,
        updated_at: null,
        name: "",
        slug: "",
        description: "",
        price: 0,
        original_price: 0,
        category_id: "",
        images: [],
        sizes: "",
        colors: "",
        stock: 0,
        featured: false,
        is_new: false,
      });
      clearCache();
      toast.success("Form cleared");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    if (formData.stock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    if (formData.images.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    mutation.mutate();
  };

  const canAddMoreImages = formData.images.length < 3;
  const hasFormData =
    !product &&
    (formData.name ||
      formData.description ||
      formData.images.length > 0 ||
      formData.price > 0 ||
      formData.stock > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            readOnly
            className="bg-muted cursor-not-allowed"
            placeholder="auto-generated-from-name"
          />
          <p className="text-xs text-muted-foreground">
            Auto-generated from product name
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>

      {/* Image Upload Section */}
      <div className="space-y-3">
        <Label>Product Images * (Max 3)</Label>
        <div className="grid grid-cols-3 gap-3">
          {/* Existing Images */}
          {formData.images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary"
            >
              {uploadingIndex === index ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm transition-opacity hover:opacity-80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      Primary
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Add More Images */}
          {canAddMoreImages && (
            <div className="relative aspect-square">
              <input
                ref={(el) => {
                  fileInputRefs.current[formData.images.length] = el;
                }}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, formData.images.length)}
                disabled={uploadingIndex !== null}
                className="hidden"
                id={`image-upload-${formData.images.length}`}
              />
              <label
                htmlFor={`image-upload-${formData.images.length}`}
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 transition-colors hover:bg-secondary"
              >
                {uploadingIndex === formData.images.length ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-xs text-muted-foreground">
                      Upload Image
                    </span>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Empty Slots */}
          {Array.from({ length: 3 - formData.images.length - 1 }).map(
            (_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded-lg border-2 border-dashed border-border bg-secondary/30 opacity-50"
              >
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </div>
            ),
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Upload up to 3 images. First image will be the primary image. Max 2MB
          per image.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price ({currency}) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="original_price">Original Price ({currency})</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.original_price}
            onChange={(e) =>
              setFormData({
                ...formData,
                original_price: Number(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: Number(e.target.value) })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => {
            const selectedCat = categories.find((c) => c.id === value);
            setFormData((prev) => ({
              ...prev,
              category_id: value,
              category_name: selectedCat?.name || "",
              // Force is_new to true if it's the new-arrival category
              is_new: selectedCat?.name === "New Arrivals" ? true : prev.is_new,
            }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sizes">Sizes (comma separated)</Label>
          <Input
            id="sizes"
            value={formData.sizes}
            onChange={(e) =>
              setFormData({ ...formData, sizes: e.target.value })
            }
            placeholder="S, M, L, XL"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="colors">Colors (comma separated)</Label>
          <Input
            id="colors"
            value={formData.colors}
            onChange={(e) =>
              setFormData({ ...formData, colors: e.target.value })
            }
            placeholder="Black, White, Navy"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, featured: checked })
            }
          />
          <Label htmlFor="featured" className="cursor-pointer">
            Featured
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="is_new"
            checked={
              formData.category_name === "New Arrivals" || formData.is_new
            }
            disabled={formData.category_name === "New Arrivals"}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_new: checked })
            }
          />
          <Label htmlFor="is_new" className="cursor-pointer">
            New Arrival
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {hasFormData && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearForm}
            disabled={mutation.isPending || uploadingIndex !== null}
          >
            Clear
          </Button>
        )}
        <Button
          type="submit"
          disabled={mutation.isPending || uploadingIndex !== null}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : product ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
}
