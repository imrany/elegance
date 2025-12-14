import { api, Product, SiteSetting } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  const [formData, setFormData] = useState({
    id: product?.id || null,
    category_name: product?.category_name || "",
    created_at: product?.created_at || "",
    updated_at: product?.updated_at || "",
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price || 0,
    original_price: product?.original_price || 0,
    category_id: product?.category_id || "",
    images: product?.images?.join("\n") || "",
    sizes: product?.sizes?.join(", ") || "",
    colors: product?.colors?.join(", ") || "",
    stock: product?.stock || 0,
    featured: product?.featured || false,
    is_new: product?.is_new || false,
  });

  const queryClient = useQueryClient();
  const setting: SiteSetting | undefined = queryClient.getQueryData(["store"]);

  const currency = setting?.value?.["currency"] || "KES";

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !product) {
      const autoSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen

      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.name, product]);

  const mutation = useMutation({
    mutationFn: async () => {
      const data = {
        id: formData.id,
        category_name: formData.category_name,
        created_at: formData.created_at,
        updated_at: formData.updated_at,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description || null,
        price: formData.price,
        original_price: formData.original_price || null,
        category_id: formData.category_id || null,
        images: formData.images.split("\n").filter(Boolean),
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
        is_new: formData.is_new,
      };

      if (product) {
        const { data: prod } = await api.updateProduct(product.id, data);
        if (!prod) throw new Error("Failed to update product");
        return prod;
      } else {
        const { data: newProduct } = await api.createProduct(data);
        if (!newProduct) throw new Error("Failed to create product");
        return newProduct;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(product ? "Product updated" : "Product created");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred");
    },
  });

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

    mutation.mutate();
  };

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
          onValueChange={(value) =>
            setFormData({ ...formData, category_id: value })
          }
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

      <div className="space-y-2">
        <Label htmlFor="images">Image URLs (one per line)</Label>
        <Textarea
          id="images"
          value={formData.images}
          onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          rows={3}
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
        />
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
            checked={formData.is_new}
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
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Saving..."
            : product
              ? "Update Product"
              : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
