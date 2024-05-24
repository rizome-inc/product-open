import apiClient from "@/api";
import { useQuery } from "@tanstack/react-query";
import { TemplateSchema } from "xylem";
import { queryClient } from "../client";

export const GET_PROJECT_TEMPLATES_QUERY_KEY = "getProjectTemplates";

export function useProjectTemplatesQuery({
  initialData,
  enabled = true,
}: {
  enabled?: boolean;
  initialData?: TemplateSchema[];
}) {
  return useQuery({
    initialData,
    enabled,
    queryKey: [GET_PROJECT_TEMPLATES_QUERY_KEY],
    queryFn: async () => {
      const res = await apiClient.template.getAll();

      if (res.status !== 200) {
        throw new Error("Failed to load templates");
      }
      return res.body;
    },
  });
}

export function invalidateProjectTemplates() {
  queryClient.invalidateQueries([GET_PROJECT_TEMPLATES_QUERY_KEY]);
}
