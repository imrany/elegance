import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  Loader2,
  X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { api, Product } from "@/lib/api";
import { useCategories } from "@/hooks/useCategories";
import { ProductForm } from "@/components/ProductForm";
import { cn } from "@/lib/utils";
import { is } from "zod/v4/locales";
import SidePanel, {
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelBody,
} from "@/components/common/SidePanel";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { data: products, isLoading } = useProducts(
    {
      search,
      limit: 100,
      offset: 0,
      order: "created_at DESC",
    },
    ["admin-products"],
  );

  const { data: categories } = useCategories();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: message } = await api.deleteProduct(id);
      if (!message) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsPanelOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setEditingProduct(null), 300); // Wait for animation
  };

  return (
    <div className="relative flex h-full">
      {/* Main Content */}
      <div
        className={cn(
          "flex-1 space-y-6 transition-all duration-300",
          // isPanelOpen ? "mr-0 lg:mr-[600px]" : "mr-0",
          "mr-0",
        )}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
              Products
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your product catalog
            </p>
          </div>

          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {!isLoading && products && (
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {!isLoading && products && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>
                {filteredProducts?.length || 0} of {products.length} products
              </span>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="rounded-lg border border-border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Product
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Price
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                    Stock
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Loading products...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : !filteredProducts || filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-12 w-12 text-muted-foreground/50" />
                        <div>
                          <p className="font-medium text-foreground">
                            No products found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {search
                              ? "Try adjusting your search"
                              : "Get started by adding your first product"}
                          </p>
                        </div>
                        {!search && (
                          <Button
                            onClick={handleAddProduct}
                            variant="outline"
                            className="mt-2"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-foreground">
                              {product.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground md:hidden">
                              {product.category_name || "No category"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                        {product.category_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {formatPrice(product.price)}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-foreground sm:table-cell">
                        <span
                          className={
                            product.stock === 0
                              ? "text-destructive"
                              : product.stock < 10
                                ? "text-orange-500"
                                : ""
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {product.featured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                          {product.is_new && (
                            <Badge variant="outline" className="text-xs">
                              New
                            </Badge>
                          )}
                          {product.stock === 0 && (
                            <Badge variant="destructive" className="text-xs">
                              Out of Stock
                            </Badge>
                          )}
                          {!product.featured &&
                            !product.is_new &&
                            product.stock > 0 && (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit {product.name}</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">
                                  Delete {product.name}
                                </span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {product.name}
                                  "? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteMutation.mutate(product.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <SidePanel isOpen={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <PanelHeader>
          <PanelTitle>
            {editingProduct ? "Edit Product" : "Add New Product"}
          </PanelTitle>
          <PanelDescription>
            {editingProduct
              ? "Update product information"
              : "Create a new product listing"}
          </PanelDescription>
        </PanelHeader>
        <PanelBody>
          <ProductForm
            product={editingProduct}
            categories={categories || []}
            onSuccess={() => {
              handleClosePanel();
              queryClient.invalidateQueries({
                queryKey: ["admin-products"],
              });
              toast.success(
                editingProduct
                  ? "Product updated successfully"
                  : "Product created successfully",
              );
            }}
          />
        </PanelBody>
      </SidePanel>
    </div>
  );
}
