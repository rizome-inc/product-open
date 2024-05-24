import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { TemplateSchema } from "xylem";
import { queryClient } from "../client";

export const GET_PROJECT_TEMPLATE_QUERY_KEY = "getProjectTemplate";

export function useProjectTemplateQuery(
  id: number,
  options?: {
    enabled?: boolean;
    initialData?: TemplateSchema;
    refetchOnWindowFocus?: boolean;
  },
) {
  return useQuery({
    enabled: options?.enabled,
    initialData: options?.initialData,
    queryKey: [GET_PROJECT_TEMPLATE_QUERY_KEY],
    queryFn: async () => {
      const res = await apiClient.template.get({
        params: {
          id: `${id}`,
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to load template");
      }
      return res.body;
    },
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  });
}

export function invalidateProjectTemplate(id?: number) {
  queryClient.invalidateQueries([GET_PROJECT_TEMPLATE_QUERY_KEY, id].filter(Boolean));
}
