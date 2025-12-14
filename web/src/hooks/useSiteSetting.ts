import { useQuery } from "@tanstack/react-query";
import { api, SiteSettingKey } from "@/lib/api";

export function useSiteSetting(key: SiteSettingKey, queryKey?: string[]) {
  return useQuery({
    queryKey: ["setting", ...(queryKey || []), key],
    queryFn: async () => {
      const response = await api.getSetting(key);
      return response.data;
    },
  });
}
