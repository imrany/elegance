import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useProducts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: Record<string, any>,
  queryKey?: string[],
) {
  return useQuery({
    queryKey: ["products", ...(queryKey || []), filters],
    queryFn: async () => {
      const response = await api.getProducts(filters);
      return response;
    },
  });
}

export function useProduct(slug: string, queryKey?: string[]) {
  return useQuery({
    queryKey: ["product", slug, ...(queryKey || [])],
    queryFn: async () => {
      const response = await api.getProductBySlug(slug);
      return response;
    },
    enabled: !!slug,
  });
}
