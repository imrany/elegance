import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCategories(queryKey?: string[]) {
  return useQuery({
    queryKey: ["categories", ...(queryKey || [])],
    queryFn: async () => {
      const response = await api.getCategories();
      return response;
    },
  });
}
