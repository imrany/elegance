import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  Loader2,
  FolderPlus,
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
import { api, Product, Category } from "@/lib/api";
import { useCategories } from "@/hooks/useCategories";
import { ProductForm } from "@/components/ProductForm";
import { cn } from "@/lib/utils";
import SidePanel, {
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelBody,
} from "@/components/common/SidePanel";
import { CategoryForm } from "@/components/CategoryForm";

type PanelTab = "product" | "category";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<PanelTab>("product");

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

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (key: string) => {
      await api.deleteCategory(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditingCategory(null);
    setCurrentTab("product");
    setIsPanelOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setEditingCategory(null);
    setCurrentTab("product");
    setIsPanelOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditingProduct(null);
    setCurrentTab("category");
    setIsPanelOpen(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setEditingProduct(null);
    setCurrentTab("category");
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setEditingProduct(null);
      setEditingCategory(null);
    }, 300); // Wait for animation
  };

  return (
    <div className="relative flex h-full">
      {/* Main Content */}
      <div
        className={cn("flex-1 space-y-6 transition-all duration-300", "mr-0")}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
              Products
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your product catalog and categories
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAddCategory} variant="outline">
              <FolderPlus className="mr-2 h-4 w-4" />
              Add Category
            </Button>

            <Button onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Categories Section */}
        {categories && categories.length > 0 && (
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">
                Categories
              </h2>
              <Button
                onClick={handleAddCategory}
                variant="ghost"
                size="sm"
                className="h-8"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="group flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1.5 transition-colors hover:bg-secondary"
                >
                  <span className="text-sm text-foreground">
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (
                    {products?.filter((p) => p.category_id === category.id)
                      .length || 0}
                    )
                  </span>
                  <div className="ml-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="rounded p-1 hover:bg-background"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="rounded p-1 hover:bg-background">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{category.name}"?
                            Products in this category will not be deleted but
                            will have no category assigned.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteCategoryMutation.mutate(
                                category.id || category.slug,
                              )
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteCategoryMutation.isPending}
                          >
                            {deleteCategoryMutation.isPending ? (
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
                </div>
              ))}
            </div>
          </div>
        )}

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
                                    deleteProductMutation.mutate(product.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={deleteProductMutation.isPending}
                                >
                                  {deleteProductMutation.isPending ? (
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
        {currentTab === "product" && (
          <>
            <PanelHeader>
              <div>
                <PanelTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </PanelTitle>
                <PanelDescription>
                  {editingProduct
                    ? "Update product information"
                    : "Create a new product listing"}
                </PanelDescription>
              </div>
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
          </>
        )}
        {currentTab === "category" && (
          <>
            <PanelHeader>
              <div>
                <PanelTitle>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </PanelTitle>
                <PanelDescription>
                  {editingCategory
                    ? "Update category information"
                    : "Create a new category"}
                </PanelDescription>
              </div>
            </PanelHeader>
            <PanelBody>
              <CategoryForm
                category={editingCategory}
                onSuccess={() => {
                  handleClosePanel();
                  queryClient.invalidateQueries({
                    queryKey: ["categories"],
                  });
                  toast.success(
                    editingCategory
                      ? "Category updated successfully"
                      : "Category created successfully",
                  );
                }}
              />
            </PanelBody>
          </>
        )}
      </SidePanel>
    </div>
  );
}
